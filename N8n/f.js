const fs = require('fs');
const path = require('path');
const { Project } = require('ts-morph');

const baseDir = '.';
const allowedDirs = new Set(['descriptions', '__schema__', 'tests']);
const importedItems = new Set();
const validDirs = [];

// Step 1: Find valid folders
for (const entry of fs.readdirSync(baseDir)) {
  const entryPath = path.join(baseDir, entry);
  if (!fs.statSync(entryPath).isDirectory()) continue;

  const contents = fs.readdirSync(entryPath);
  const subdirs = contents.filter(name => {
    const fullPath = path.join(entryPath, name);
    return fs.statSync(fullPath).isDirectory();
  });

  const allValid = subdirs.every(dir => allowedDirs.has(dir));
  /*if (allValid)*/ validDirs.push(entryPath);
}

// Step 2: Recursively find all `.ts` files excluding tests folder
function getAllTSFiles(dir) {
  const files = [];

  const walk = currentPath => {
    for (const item of fs.readdirSync(currentPath)) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (item === 'tests') continue;
        walk(itemPath);
      } else if (item.endsWith('.ts')) {
        files.push(itemPath);
      }
    }
  };

  walk(dir);
  return files;
}

// Step 3: Use ts-morph to analyze imports
const project = new Project();
const seenNames = new Map(); // Map name -> isTypeOnly

for (const dir of validDirs) {
  const tsFiles = getAllTSFiles(dir);

  for (const file of tsFiles) {
    const sourceFile = project.addSourceFileAtPath(file);
    const importsFromN8n = sourceFile
      .getImportDeclarations()
      .filter(imp => imp.getModuleSpecifierValue() === 'n8n-workflow');
      
      console.log("AnalysIng : ",file);

    for (const imp of importsFromN8n) {
      for (const namedImport of imp.getNamedImports()) {
        const name = namedImport.getName();
        const isTypeOnly = namedImport.isTypeOnly();
        console.log('It HAs : ', name)

        if (!seenNames.has(name)) {
            
          seenNames.set(name, isTypeOnly);
        } else if (!isTypeOnly) {
          seenNames.set(name, false); // Promote to runtime if both seen
        }
      }
    }
  }
}

// Step 4: Prepare and write output
const output = Array.from(seenNames.entries())
  .map(([name, isTypeOnly]) => (isTypeOnly ? `type ${name}` : name))
  .sort();

output.forEach(i => console.log(i));
fs.writeFileSync('./imp.txt', output.join('\n'), 'utf8');

console.log(`\nTotal unique imports from 'n8n-workflow': ${output.length}`);
console.log('Saved to ./imp.txt');





const sourceRoot = '/storage/emulated/0/n8n/packages/workflow/src/';
const allCodeOutput = [];

const resolvedProject = new Project({
  tsConfigFilePath: path.join(sourceRoot, '../tsconfig.json'), // Optional: improves accuracy
  skipAddingFilesFromTsConfig: true,
});

// Load all .ts source files from workflow/src recursively
function loadAllWorkflowFiles(dir) {
  const result = [];

  const walk = currentPath => {
    for (const item of fs.readdirSync(currentPath)) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        walk(itemPath);
      } else if (item.endsWith('.ts')) {
        result.push(itemPath);
      }
    }
  };

  walk(dir);
  return result;
}

const workflowFiles = loadAllWorkflowFiles(sourceRoot);
resolvedProject.addSourceFilesAtPaths(workflowFiles);

const sourceFiles = resolvedProject.getSourceFiles();
const foundNames = new Set();

for (const [rawName, isTypeOnly] of seenNames.entries()) {
  const name = rawName.replace(/^type /, '');

  for (const sourceFile of sourceFiles) {
    // Search for class, interface, type alias, function, const
    const decl = (
      sourceFile.getInterface(name) ||
      sourceFile.getTypeAlias(name) ||
      sourceFile.getFunction(name) ||
      sourceFile.getVariableDeclaration(name) ||
      sourceFile.getClass(name)
    );

    if (decl) {
      const fullText = decl.getText();
      allCodeOutput.push(`// module: ${rawName}\n${fullText}\n// end module: ${rawName}\n`);
      foundNames.add(name);
      break;
    }
  }

  if (!foundNames.has(name)) {
    allCodeOutput.push(`// module: ${rawName} NOT FOUND\n`);
  }
}

fs.writeFileSync('./allCodes.ts', allCodeOutput.join('\n\n'), 'utf8');
console.log(`\nGenerated ./allCodes.ts with ${allCodeOutput.length} module(s).`);