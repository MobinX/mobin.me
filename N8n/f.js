const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind, Node } = require('ts-morph');

// CONFIG
const ROOT_DIR = '.';
const WORKFLOW_SRC = '/storage/emulated/0/n8n/packages/workflow/src/';
const project = new Project();

const seenNames = new Map(); // name -> { isTypeOnly }
const importOutput = [];
const allCodeOutput = [];
const usageExamples = new Map();

// Step 1: Get valid directories
function getValidDirectories(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  return entries
    .filter(d => d.isDirectory())
    .map(d => path.join(baseDir, d.name))
    .filter(dirPath => {
      const children = fs.readdirSync(dirPath, { withFileTypes: true });
      const allowed = ['__schema__', 'tests'];
      const childDirs = children.filter(f => f.isDirectory()).map(f => f.name);
      return childDirs;
    });
}

// Step 2: Get all .ts files recursively (ignore /tests)
function getAllTSFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'tests') {
      files = files.concat(getAllTSFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Step 3: Collect Imports & Examples
function collectImportsFromFiles(files) {
  for (const file of files) {
    const sourceFile = project.addSourceFileAtPath(file);
    const imports = sourceFile.getImportDeclarations().filter(i => i.getModuleSpecifierValue() === 'n8n-workflow');

    for (const imp of imports) {
      for (const named of imp.getNamedImports()) {
        const name = named.getName();
        const isTypeOnly = named.isTypeOnly?.() || false;
        if (!seenNames.has(name)) {
          seenNames.set(name, { isTypeOnly });

          // Try to find an example usage in this file
          const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).filter(id => id.getText() === name);
          for (const id of identifiers) {
            const exampleNode = id.getFirstAncestor(node =>
              Node.isExpressionStatement(node) ||
              Node.isVariableStatement(node) ||
              Node.isReturnStatement(node) ||
              Node.isCallExpression(node) ||
              Node.isIfStatement(node)
            );
            if (exampleNode) {
              usageExamples.set(name, exampleNode.getText());
              break;
            }
          }
        }
      }
    }
  }
}

// Step 4: Extract definitions from workflow source
function extractSourceDefinitions() {
  for (const [name, meta] of seenNames.entries()) {
    let found = false;

    function search(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          search(fullPath);
        } else if (entry.name.endsWith('.ts')) {
          const srcFile = project.addSourceFileAtPathIfExists(fullPath);
          if (!srcFile) continue;

          const exported = srcFile.getExportedDeclarations().get(name);
          if (exported && exported.length > 0) {
            const node = exported[0];
            const kind = node.getKindName();
            const label = kind.includes('Function') ? 'function' : meta.isTypeOnly ? 'type' : kind.toLowerCase();
            const code = node.getText();
            allCodeOutput.push(`// ${label}: ${name}\n${code}\n// end ${name}`);
            importOutput.push(`${label} ${name}`);
            found = true;
            return;
          }
        }
        if (found) return;
      }
    }

    search(WORKFLOW_SRC);
  }
}

// MAIN
const validDirs = getValidDirectories(ROOT_DIR);
let allFiles = [];
for (const dir of validDirs) {
  allFiles = allFiles.concat(getAllTSFiles(dir));
}

collectImportsFromFiles(allFiles);
extractSourceDefinitions();

// Write Outputs
fs.writeFileSync('./imp.txt', importOutput.sort().join('\n'), 'utf8');
fs.writeFileSync('./allCodes.ts', allCodeOutput.join('\n\n'), 'utf8');

const exampleOutput = [];
for (const [name, code] of usageExamples.entries()) {
  exampleOutput.push(`// example: ${name}\n${code}`);
}
fs.writeFileSync('./example.txt', exampleOutput.join('\n\n'), 'utf8');

console.log(`✅ Generated imp.txt, allCodes.ts, and example.txt (${importOutput.length} unique imports).`);