// interfacedeclaration: IDataObject
export interface IDataObject {
	[key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}
// end IDataObject

// typealiasdeclaration: IExecuteFunctions
export type IExecuteFunctions = ExecuteFunctions.GetNodeParameterFn &
	BaseExecutionFunctions & {
		executeWorkflow(
			workflowInfo: IExecuteWorkflowInfo,
			inputData?: INodeExecutionData[],
			parentCallbackManager?: CallbackManager,
			options?: {
				doNotWaitToFinish?: boolean;
				parentExecution?: RelatedExecution;
			},
		): Promise<ExecuteWorkflowData>;
		getInputConnectionData(
			connectionType: AINodeConnectionType,
			itemIndex: number,
			inputIndex?: number,
		): Promise<unknown>;
		getInputData(inputIndex?: number, connectionType?: NodeConnectionType): INodeExecutionData[];
		getNodeInputs(): INodeInputConfiguration[];
		getNodeOutputs(): INodeOutputConfiguration[];
		putExecutionToWait(waitTill: Date): Promise<void>;
		sendMessageToUI(message: any): void;
		sendResponse(response: IExecuteResponsePromiseData): void;

		// TODO: Make this one then only available in the new config one
		addInputData(
			connectionType: NodeConnectionType,
			data: INodeExecutionData[][] | ExecutionError,
			runIndex?: number,
		): { index: number };
		addOutputData(
			connectionType: NodeConnectionType,
			currentNodeRunIndex: number,
			data: INodeExecutionData[][] | ExecutionError,
			metadata?: ITaskMetadata,
		): void;

		addExecutionHints(...hints: NodeExecutionHint[]): void;

		nodeHelpers: NodeHelperFunctions;
		helpers: RequestHelperFunctions &
			BaseHelperFunctions &
			BinaryHelperFunctions &
			DeduplicationHelperFunctions &
			FileSystemHelperFunctions &
			SSHTunnelFunctions & {
				normalizeItems(items: INodeExecutionData | INodeExecutionData[]): INodeExecutionData[];
				constructExecutionMetaData(
					inputData: INodeExecutionData[],
					options: { itemData: IPairedItemData | IPairedItemData[] },
				): NodeExecutionWithMetadata[];
				assertBinaryData(itemIndex: number, propertyName: string): IBinaryData;
				getBinaryDataBuffer(itemIndex: number, propertyName: string): Promise<Buffer>;
				detectBinaryEncoding(buffer: Buffer): string;
				copyInputItems(items: INodeExecutionData[], properties: string[]): IDataObject[];
			};

		getParentCallbackManager(): CallbackManager | undefined;

		startJob<T = unknown, E = unknown>(
			jobType: string,
			settings: unknown,
			itemIndex: number,
		): Promise<Result<T, E>>;
	};
// end IExecuteFunctions

// interfacedeclaration: INodeExecutionData
export interface INodeExecutionData {
	[key: string]:
		| IDataObject
		| IBinaryKeyData
		| IPairedItemData
		| IPairedItemData[]
		| NodeApiError
		| NodeOperationError
		| number
		| undefined;
	json: IDataObject;
	binary?: IBinaryKeyData;
	error?: NodeApiError | NodeOperationError;
	pairedItem?: IPairedItemData | IPairedItemData[] | number;
	metadata?: {
		subExecution: RelatedExecution;
	};

	/**
	 * @deprecated This key was added by accident and should not be used as it
	 * will be removed in future. For more information see PR #12469.
	 */
	index?: number;
}
// end INodeExecutionData

// interfacedeclaration: INodeType
export interface INodeType {
	description: INodeTypeDescription;
	supplyData?(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData>;
	execute?(this: IExecuteFunctions): Promise<NodeOutput>;
	poll?(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
	trigger?(this: ITriggerFunctions): Promise<ITriggerResponse | undefined>;
	webhook?(this: IWebhookFunctions): Promise<IWebhookResponseData>;
	methods?: {
		loadOptions?: {
			[key: string]: (this: ILoadOptionsFunctions) => Promise<INodePropertyOptions[]>;
		};
		listSearch?: {
			[key: string]: (
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			) => Promise<INodeListSearchResult>;
		};
		credentialTest?: {
			// Contains a group of functions that test credentials.
			[functionName: string]: ICredentialTestFunction;
		};
		resourceMapping?: {
			[functionName: string]: (this: ILoadOptionsFunctions) => Promise<ResourceMapperFields>;
		};
		localResourceMapping?: {
			[functionName: string]: (this: ILocalLoadOptionsFunctions) => Promise<ResourceMapperFields>;
		};
		actionHandler?: {
			[functionName: string]: (
				this: ILoadOptionsFunctions,
				payload: IDataObject | string | undefined,
			) => Promise<NodeParameterValueType>;
		};
	};
	webhookMethods?: {
		[name in WebhookType]?: {
			[method in WebhookSetupMethodNames]: (this: IHookFunctions) => Promise<boolean>;
		};
	};
	/**
	 * Defines custom operations for nodes that do not implement an `execute` method, such as declarative nodes.
	 * This function will be invoked instead of `execute` for a specific resource and operation.
	 * Should be either `execute` or `customOperations` defined for a node, but not both.
	 *
	 * @property customOperations - Maps specific resource and operation to a custom function
	 */
	customOperations?: {
		[resource: string]: {
			[operation: string]: (this: IExecuteFunctions) => Promise<NodeOutput>;
		};
	};
}
// end INodeType

// interfacedeclaration: INodeTypeDescription
export interface INodeTypeDescription extends INodeTypeBaseDescription {
	version: number | number[];
	defaults: NodeDefaults;
	eventTriggerDescription?: string;
	activationMessage?: string;
	inputs: Array<NodeConnectionType | INodeInputConfiguration> | ExpressionString;
	requiredInputs?: string | number[] | number; // Ony available with executionOrder => "v1"
	inputNames?: string[];
	outputs: Array<NodeConnectionType | INodeOutputConfiguration> | ExpressionString;
	outputNames?: string[];
	properties: INodeProperties[];
	credentials?: INodeCredentialDescription[];
	maxNodes?: number; // How many nodes of that type can be created in a workflow
	polling?: true | undefined;
	supportsCORS?: true | undefined;
	requestDefaults?: DeclarativeRestApiSettings.HttpRequestOptions;
	requestOperations?: IN8nRequestOperations;
	hooks?: {
		[key: string]: INodeHookDescription[] | undefined;
		activate?: INodeHookDescription[];
		deactivate?: INodeHookDescription[];
	};
	webhooks?: IWebhookDescription[];
	translation?: { [key: string]: object };
	mockManualExecution?: true;
	triggerPanel?: TriggerPanelDefinition | boolean;
	extendsCredential?: string;
	hints?: NodeHint[];
	__loadOptionsMethods?: string[]; // only for validation during build
}
// end INodeTypeDescription

// variabledeclaration: NodeConnectionTypes
NodeConnectionTypes = {
	AiAgent: 'ai_agent',
	AiChain: 'ai_chain',
	AiDocument: 'ai_document',
	AiEmbedding: 'ai_embedding',
	AiLanguageModel: 'ai_languageModel',
	AiMemory: 'ai_memory',
	AiOutputParser: 'ai_outputParser',
	AiRetriever: 'ai_retriever',
	AiTextSplitter: 'ai_textSplitter',
	AiTool: 'ai_tool',
	AiVectorStore: 'ai_vectorStore',
	Main: 'main',
} as const
// end NodeConnectionTypes

// classdeclaration: NodeOperationError
export class NodeOperationError extends NodeError {
	type: string | undefined;

	constructor(
		node: INode,
		error: Error | string | JsonObject,
		options: NodeOperationErrorOptions = {},
	) {
		if (error instanceof NodeOperationError) {
			return error;
		}

		if (typeof error === 'string') {
			error = new ApplicationError(error, { level: options.level ?? 'warning' });
		}

		super(node, error);

		if (error instanceof NodeError && error?.messages?.length) {
			error.messages.forEach((message) => this.addToMessages(message));
		}

		if (options.message) this.message = options.message;
		this.level = options.level ?? 'warning';
		if (options.functionality) this.functionality = options.functionality;
		if (options.type) this.type = options.type;
		this.description = options.description;
		this.context.runIndex = options.runIndex;
		this.context.itemIndex = options.itemIndex;
		this.context.metadata = options.metadata;

		if (this.message === this.description) {
			this.description = undefined;
		}

		[this.message, this.messages] = this.setDescriptiveErrorMessage(
			this.message,
			this.messages,
			undefined,
			options.messageMapping,
		);
	}
}
// end NodeOperationError

// typealiasdeclaration: IHttpRequestMethods
export type IHttpRequestMethods = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';
// end IHttpRequestMethods

// interfacedeclaration: ILoadOptionsFunctions
export interface ILoadOptionsFunctions extends FunctionsBase {
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;
	getCurrentNodeParameter(
		parameterName: string,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object | undefined;
	getCurrentNodeParameters(): INodeParameters | undefined;

	helpers: RequestHelperFunctions & SSHTunnelFunctions;
}
// end ILoadOptionsFunctions

// interfacedeclaration: IRequestOptions
export interface IRequestOptions {
	baseURL?: string;
	uri?: string;
	url?: string;
	method?: IHttpRequestMethods;
	qs?: IDataObject;
	qsStringifyOptions?: { arrayFormat: 'repeat' | 'brackets' | 'indices' };
	useQuerystring?: boolean;
	headers?: IDataObject;
	auth?: Partial<{
		sendImmediately: boolean;
		bearer: string;
		user: string;
		username: string;
		password: string;
		pass: string;
	}>;
	body?: any;
	formData?: IDataObject | FormData;
	form?: IDataObject | FormData;
	json?: boolean;
	useStream?: boolean;
	encoding?: string | null;
	timeout?: number;
	rejectUnauthorized?: boolean;
	proxy?: string | AxiosProxyConfig;
	simple?: boolean;
	gzip?: boolean;
	resolveWithFullResponse?: boolean;

	/** Whether to follow GET or HEAD HTTP 3xx redirects @default true */
	followRedirect?: boolean;

	/** Whether to follow **All** HTTP 3xx redirects @default false */
	followAllRedirects?: boolean;

	/** Max number of redirects to follow @default 21 */
	maxRedirects?: number;

	agentOptions?: SecureContextOptions;
}
// end IRequestOptions

// interfacedeclaration: INodeProperties
export interface INodeProperties {
	displayName: string;
	name: string;
	type: NodePropertyTypes;
	typeOptions?: INodePropertyTypeOptions;
	default: NodeParameterValueType;
	description?: string;
	hint?: string;
	disabledOptions?: IDisplayOptions;
	displayOptions?: IDisplayOptions;
	options?: Array<INodePropertyOptions | INodeProperties | INodePropertyCollection>;
	placeholder?: string;
	isNodeSetting?: boolean;
	noDataExpression?: boolean;
	required?: boolean;
	routing?: INodePropertyRouting;
	credentialTypes?: Array<
		'extends:oAuth2Api' | 'extends:oAuth1Api' | 'has:authenticate' | 'has:genericAuth'
	>;
	extractValue?: INodePropertyValueExtractor;
	modes?: INodePropertyMode[];
	requiresDataPath?: 'single' | 'multiple';
	doNotInherit?: boolean;
	// set expected type for the value which would be used for validation and type casting
	validateType?: FieldType;
	// works only if validateType is set
	// allows to skip validation during execution or set custom validation/casting logic inside node
	// inline error messages would still be shown in UI
	ignoreValidationDuringExecution?: boolean;
}
// end INodeProperties

// interfacedeclaration: INodePropertyOptions
export interface INodePropertyOptions {
	name: string;
	value: string | number | boolean;
	action?: string;
	description?: string;
	routing?: INodePropertyRouting;
	outputConnectionType?: NodeConnectionType;
	inputSchema?: any;
}
// end INodePropertyOptions

// interfacedeclaration: IHookFunctions
export interface IHookFunctions
	extends FunctionsBaseWithRequiredKeys<'getMode' | 'getActivationMode'> {
	getWebhookName(): string;
	getWebhookDescription(name: WebhookType): IWebhookDescription | undefined;
	getNodeWebhookUrl: (name: WebhookType) => string | undefined;
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;
	helpers: RequestHelperFunctions;
}
// end IHookFunctions

// interfacedeclaration: IWebhookFunctions
export interface IWebhookFunctions extends FunctionsBaseWithRequiredKeys<'getMode'> {
	getBodyData(): IDataObject;
	getHeaderData(): IncomingHttpHeaders;
	getInputConnectionData(
		connectionType: AINodeConnectionType,
		itemIndex: number,
		inputIndex?: number,
	): Promise<unknown>;
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;
	getNodeWebhookUrl: (name: WebhookType) => string | undefined;
	evaluateExpression(expression: string, itemIndex?: number): NodeParameterValueType;
	getParamsData(): object;
	getQueryData(): object;
	getRequestObject(): express.Request;
	getResponseObject(): express.Response;
	getWebhookName(): string;
	nodeHelpers: NodeHelperFunctions;
	helpers: RequestHelperFunctions & BaseHelperFunctions & BinaryHelperFunctions;
}
// end IWebhookFunctions

// interfacedeclaration: IWebhookResponseData
export interface IWebhookResponseData {
	workflowData?: INodeExecutionData[][];
	webhookResponse?: any;
	noWebhookResponse?: boolean;
}
// end IWebhookResponseData

// typealiasdeclaration: JsonObject
export type JsonObject = { [key: string]: JsonValue };
// end JsonObject

// classdeclaration: NodeApiError
export class NodeApiError extends NodeError {
	httpCode: string | null = null;

	// eslint-disable-next-line complexity
	constructor(
		node: INode,
		errorResponse: JsonObject,
		{
			message,
			description,
			httpCode,
			parseXml,
			runIndex,
			itemIndex,
			level,
			functionality,
			messageMapping,
		}: NodeApiErrorOptions = {},
	) {
		if (errorResponse instanceof NodeApiError) {
			return errorResponse;
		}

		super(node, errorResponse);

		this.addToMessages(errorResponse.message as string);

		if (!httpCode && errorResponse instanceof AxiosError) {
			httpCode = errorResponse.response?.status?.toString();
		}

		// only for request library error
		if (errorResponse.error) {
			removeCircularRefs(errorResponse.error as JsonObject);
		}

		// if not description provided, try to find it in the error object

		if (
			!description &&
			(errorResponse.description || (errorResponse?.reason as IDataObject)?.description)
		) {
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			this.description = (errorResponse.description ||
				(errorResponse?.reason as IDataObject)?.description) as string;
		}

		// if not message provided, try to find it in the error object or set description as message

		if (
			!message &&
			(errorResponse.message || (errorResponse?.reason as IDataObject)?.message || description)
		) {
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			this.message = (errorResponse.message ||
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				(errorResponse?.reason as IDataObject)?.message ||
				description) as string;
		}

		// if it's an error generated by axios
		// look for descriptions in the response object
		if (errorResponse.reason) {
			const reason: IDataObject = errorResponse.reason as unknown as IDataObject;

			if (reason.isAxiosError && reason.response) {
				errorResponse = reason.response as JsonObject;
			}
		}

		// set http code of this error
		if (httpCode) {
			this.httpCode = httpCode;
		} else if (errorResponse.httpCode) {
			this.httpCode = errorResponse.httpCode as string;
		} else {
			this.httpCode =
				this.findProperty(
					errorResponse,
					POSSIBLE_ERROR_STATUS_KEYS,
					POSSIBLE_NESTED_ERROR_OBJECT_KEYS,
				) ?? null;
		}

		this.level = level ?? 'warning';

		if (
			errorResponse?.response &&
			typeof errorResponse?.response === 'object' &&
			!Array.isArray(errorResponse.response) &&
			errorResponse.response.data &&
			typeof errorResponse.response.data === 'object' &&
			!Array.isArray(errorResponse.response.data)
		) {
			const data = errorResponse.response.data;

			if (data.message) {
				description = data.message as string;
			} else if (data.error && ((data.error as IDataObject) || {}).message) {
				description = (data.error as IDataObject).message as string;
			}

			this.context.data = data;
		}

		// set description of this error
		if (description) {
			this.description = description;
		}

		if (!this.description) {
			if (parseXml) {
				this.setDescriptionFromXml(errorResponse.error as string);
			} else {
				this.description = this.findProperty(
					errorResponse,
					POSSIBLE_ERROR_MESSAGE_KEYS,
					POSSIBLE_NESTED_ERROR_OBJECT_KEYS,
				);
			}
		}

		// set message if provided
		// set default message based on http code
		// or use raw error message
		if (message) {
			this.message = message;
		} else {
			this.setDefaultStatusCodeMessage();
		}

		// if message and description are the same, unset redundant description
		if (this.message === this.description) {
			this.description = undefined;
		}

		// if message contain common error code set descriptive message and update description
		[this.message, this.messages] = this.setDescriptiveErrorMessage(
			this.message,
			this.messages,
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			this.httpCode ||
				(errorResponse?.code as string) ||
				((errorResponse?.reason as JsonObject)?.code as string) ||
				undefined,
			messageMapping,
		);

		if (functionality !== undefined) this.functionality = functionality;
		if (runIndex !== undefined) this.context.runIndex = runIndex;
		if (itemIndex !== undefined) this.context.itemIndex = itemIndex;
	}

	private setDescriptionFromXml(xml: string) {
		parseString(xml, { explicitArray: false }, (_, result) => {
			if (!result) return;

			const topLevelKey = Object.keys(result)[0];
			this.description = this.findProperty(
				result[topLevelKey],
				POSSIBLE_ERROR_MESSAGE_KEYS,
				POSSIBLE_NESTED_ERROR_OBJECT_KEYS,
			);
		});
	}

	/**
	 * Set the error's message based on the HTTP status code.
	 */
	private setDefaultStatusCodeMessage() {
		// Set generic error message for 502 Bad Gateway
		if (!this.httpCode && this.message && this.message.toLowerCase().includes('bad gateway')) {
			this.httpCode = '502';
		}

		if (!this.httpCode) {
			this.httpCode = null;

			if (!this.message) {
				if (this.description) {
					this.message = this.description;
					this.description = undefined;
				} else {
					this.message = UNKNOWN_ERROR_MESSAGE;
					this.description = UNKNOWN_ERROR_DESCRIPTION;
				}
			}
			return;
		}

		if (STATUS_CODE_MESSAGES[this.httpCode]) {
			this.addToMessages(this.message);
			this.message = STATUS_CODE_MESSAGES[this.httpCode];
			return;
		}

		switch (this.httpCode.charAt(0)) {
			case '4':
				this.addToMessages(this.message);
				this.message = STATUS_CODE_MESSAGES['4XX'];
				break;
			case '5':
				this.addToMessages(this.message);
				this.message = STATUS_CODE_MESSAGES['5XX'];
				break;
			default:
				if (!this.message) {
					if (this.description) {
						this.message = this.description;
						this.description = undefined;
					} else {
						this.message = UNKNOWN_ERROR_MESSAGE;
						this.description = UNKNOWN_ERROR_DESCRIPTION;
					}
				}
		}
		if (this.node.type === NO_OP_NODE_TYPE && this.message === UNKNOWN_ERROR_MESSAGE) {
			this.message = `${UNKNOWN_ERROR_MESSAGE_CRED} - ${this.httpCode}`;
		}
	}
}
// end NodeApiError

// type: IExecuteSingleFunctions
export interface IExecuteSingleFunctions extends BaseExecutionFunctions {
	getInputData(inputIndex?: number, connectionType?: NodeConnectionType): INodeExecutionData;
	getItemIndex(): number;
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;

	helpers: RequestHelperFunctions &
		BaseHelperFunctions &
		BinaryHelperFunctions & {
			assertBinaryData(propertyName: string, inputIndex?: number): IBinaryData;
			getBinaryDataBuffer(propertyName: string, inputIndex?: number): Promise<Buffer>;
			detectBinaryEncoding(buffer: Buffer): string;
		};
}
// end IExecuteSingleFunctions

// type: IHttpRequestOptions
export interface IHttpRequestOptions {
	url: string;
	baseURL?: string;
	headers?: IDataObject;
	method?: IHttpRequestMethods;
	body?: FormData | GenericValue | GenericValue[] | Buffer | URLSearchParams;
	qs?: IDataObject;
	arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
	auth?: {
		username: string;
		password: string;
		sendImmediately?: boolean;
	};
	disableFollowRedirect?: boolean;
	encoding?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
	skipSslCertificateValidation?: boolean;
	returnFullResponse?: boolean;
	ignoreHttpStatusErrors?: boolean;
	proxy?: {
		host: string;
		port: number;
		auth?: {
			username: string;
			password: string;
		};
		protocol?: string;
	};
	timeout?: number;
	json?: boolean;
	abortSignal?: GenericAbortSignal;
}
// end IHttpRequestOptions

// variabledeclaration: BINARY_ENCODING
BINARY_ENCODING = 'base64'
// end BINARY_ENCODING

// variabledeclaration: jsonParse
jsonParse = <T>(jsonString: string, options?: JSONParseOptions<T>): T => {
	try {
		return JSON.parse(jsonString) as T;
	} catch (error) {
		if (options?.acceptJSObject) {
			try {
				const jsonStringCleaned = parseJSObject(jsonString);
				return jsonStringCleaned as T;
			} catch (e) {
				// Ignore this error and return the original error or the fallback value
			}
		}
		if (options?.fallbackValue !== undefined) {
			if (options.fallbackValue instanceof Function) {
				return options.fallbackValue();
			}
			return options.fallbackValue;
		} else if (options?.errorMessage) {
			throw new ApplicationError(options.errorMessage);
		}

		throw error;
	}
}
// end jsonParse

// variabledeclaration: AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT
AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT = 'codeGeneratedForPrompt'
// end AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT

// variabledeclaration: AI_TRANSFORM_JS_CODE
AI_TRANSFORM_JS_CODE = 'jsCode'
// end AI_TRANSFORM_JS_CODE

// interfacedeclaration: INodeTypeBaseDescription
export interface INodeTypeBaseDescription {
	displayName: string;
	name: string;
	icon?: Icon;
	iconColor?: ThemeIconColor;
	iconUrl?: Themed<string>;
	badgeIconUrl?: Themed<string>;
	group: NodeGroupType[];
	description: string;
	documentationUrl?: string;
	subtitle?: string;
	defaultVersion?: number;
	codex?: CodexData;
	parameterPane?: 'wide';

	/**
	 * Whether the node must be hidden in the node creator panel,
	 * due to deprecation or as a special case (e.g. Start node)
	 */
	hidden?: true;

	/**
	 * Whether the node will be wrapped for tool-use by AI Agents,
	 * optionally replacing provided parts of the description
	 */
	usableAsTool?: true | UsableAsToolDescription;
}
// end INodeTypeBaseDescription

// interfacedeclaration: IVersionedNodeType
export interface IVersionedNodeType {
	nodeVersions: {
		[key: number]: INodeType;
	};
	currentVersion: number;
	description: INodeTypeBaseDescription;
	getNodeType: (version?: number) => INodeType;
}
// end IVersionedNodeType

// classdeclaration: VersionedNodeType
export class VersionedNodeType implements IVersionedNodeType {
	currentVersion: number;

	nodeVersions: IVersionedNodeType['nodeVersions'];

	description: INodeTypeBaseDescription;

	constructor(
		nodeVersions: IVersionedNodeType['nodeVersions'],
		description: INodeTypeBaseDescription,
	) {
		this.nodeVersions = nodeVersions;
		this.currentVersion = description.defaultVersion ?? this.getLatestVersion();
		this.description = description;
	}

	getLatestVersion() {
		return Math.max(...Object.keys(this.nodeVersions).map(Number));
	}

	getNodeType(version?: number): INodeType {
		if (version) {
			return this.nodeVersions[version];
		} else {
			return this.nodeVersions[this.currentVersion];
		}
	}
}
// end VersionedNodeType

// interfacedeclaration: IPollFunctions
export interface IPollFunctions
	extends FunctionsBaseWithRequiredKeys<'getMode' | 'getActivationMode'> {
	__emit(
		data: INodeExecutionData[][],
		responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>,
		donePromise?: IDeferredPromise<IRun>,
	): void;
	__emitError(error: Error, responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>): void;
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;
	helpers: RequestHelperFunctions &
		BaseHelperFunctions &
		BinaryHelperFunctions &
		SchedulingFunctions;
}
// end IPollFunctions

// interfacedeclaration: WorkflowTestData
export interface WorkflowTestData {
	description: string;
	input: {
		workflowData: {
			nodes: INode[];
			connections: IConnections;
			settings?: IWorkflowSettings;
		};
	};
	output: {
		assertBinaryData?: boolean;
		nodeExecutionOrder?: string[];
		nodeExecutionStack?: IExecuteData[];
		testAllOutputs?: boolean;
		nodeData: {
			[key: string]: any[][];
		};
		error?: string;
	};
	nock?: {
		baseUrl: string;
		mocks: Array<{
			method: 'delete' | 'get' | 'patch' | 'post' | 'put';
			path: string;
			requestBody?: RequestBodyMatcher;
			requestHeaders?: Record<string, RequestHeaderMatcher>;
			statusCode: number;
			responseBody: string | object;
			responseHeaders?: ReplyHeaders;
		}>;
	};
	trigger?: {
		mode: WorkflowExecuteMode;
		input: INodeExecutionData;
	};
	credentials?: Record<string, ICredentialDataDecryptedObject>;
}
// end WorkflowTestData

// interfacedeclaration: IGetNodeParameterOptions
export interface IGetNodeParameterOptions {
	contextNode?: INode;
	// make sure that returned value would be of specified type, converts it if needed
	ensureType?: EnsureTypeOptions;
	// extract value from regex, works only when parameter type is resourceLocator
	extractValue?: boolean;
	// get raw value of parameter with unresolved expressions
	rawExpressions?: boolean;
	// skip validation of parameter
	skipValidation?: boolean;
}
// end IGetNodeParameterOptions

// interfacedeclaration: INode
export interface INode {
	id: string;
	name: string;
	typeVersion: number;
	type: string;
	position: [number, number];
	disabled?: boolean;
	notes?: string;
	notesInFlow?: boolean;
	retryOnFail?: boolean;
	maxTries?: number;
	waitBetweenTries?: number;
	alwaysOutputData?: boolean;
	executeOnce?: boolean;
	onError?: OnError;
	continueOnFail?: boolean;
	parameters: INodeParameters;
	credentials?: INodeCredentials;
	webhookId?: string;
	extendsCredential?: string;
	rewireOutputLogTo?: NodeConnectionType;
}
// end INode

// interfacedeclaration: IBinaryKeyData
export interface IBinaryKeyData {
	[key: string]: IBinaryData;
}
// end IBinaryKeyData

// interfacedeclaration: IPairedItemData
export interface IPairedItemData {
	item: number;
	input?: number; // If undefined "0" gets used
	sourceOverwrite?: ISourceData;
}
// end IPairedItemData

// typealiasdeclaration: AllEntities
export type AllEntities<M> = M extends { [key: string]: string } ? Entity<M, keyof M> : never;
// end AllEntities

// classdeclaration: ApplicationError
export class ApplicationError extends Error {
	level: ErrorLevel;

	readonly tags: NonNullable<Event['tags']>;

	readonly extra?: Event['extra'];

	readonly packageName?: string;

	constructor(
		message: string,
		{ level, tags = {}, extra, ...rest }: Partial<ErrorOptions> & ReportingOptions = {},
	) {
		super(message, rest);
		this.level = level ?? 'error';
		this.tags = tags;
		this.extra = extra;

		try {
			const filePath = callsites()[2].getFileName() ?? '';
			const match = /packages\/([^\/]+)\//.exec(filePath)?.[1];

			if (match) this.tags.packageName = match;
		} catch {}
	}
}
// end ApplicationError

// interfacedeclaration: INodeListSearchItems
export interface INodeListSearchItems extends INodePropertyOptions {
	icon?: string;
	url?: string;
}
// end INodeListSearchItems

// interfacedeclaration: INodeListSearchResult
export interface INodeListSearchResult {
	results: INodeListSearchItems[];
	paginationToken?: unknown;
}
// end INodeListSearchResult

// typealiasdeclaration: FieldType
export type FieldType = keyof FieldTypeMap;
// end FieldType

// interfacedeclaration: ResourceMapperField
export interface ResourceMapperField {
	id: string;
	displayName: string;
	defaultMatch: boolean;
	canBeUsedToMatch?: boolean;
	required: boolean;
	display: boolean;
	type?: FieldType;
	removed?: boolean;
	options?: INodePropertyOptions[];
	readOnly?: boolean;
}
// end ResourceMapperField

// interfacedeclaration: ResourceMapperFields
export interface ResourceMapperFields {
	fields: ResourceMapperField[];
	emptyFieldsNotice?: string;
}
// end ResourceMapperFields

// interfacedeclaration: IBinaryData
export interface IBinaryData {
	[key: string]: string | number | undefined;
	data: string;
	mimeType: string;
	fileType?: BinaryFileType;
	fileName?: string;
	directory?: string;
	fileExtension?: string;
	fileSize?: string; // TODO: change this to number and store the actual value
	id?: string;
}
// end IBinaryData

// interfacedeclaration: ICredentialTestFunctions
export interface ICredentialTestFunctions {
	logger: Logger;
	helpers: SSHTunnelFunctions & {
		request: (uriOrObject: string | object, options?: object) => Promise<any>;
	};
}
// end ICredentialTestFunctions

// interfacedeclaration: INodeCredentialTestResult
export interface INodeCredentialTestResult {
	status: 'OK' | 'Error';
	message: string;
}
// end INodeCredentialTestResult

// interfacedeclaration: ICredentialsDecrypted
export interface ICredentialsDecrypted<T extends object = ICredentialDataDecryptedObject> {
	id: string;
	name: string;
	type: string;
	data?: T;
	homeProject?: ProjectSharingData;
	sharedWithProjects?: ProjectSharingData[];
}
// end ICredentialsDecrypted

// interfacedeclaration: ICredentialDataDecryptedObject
export interface ICredentialDataDecryptedObject {
	[key: string]: CredentialInformation;
}
// end ICredentialDataDecryptedObject

// interfacedeclaration: ITriggerFunctions
export interface ITriggerFunctions
	extends FunctionsBaseWithRequiredKeys<'getMode' | 'getActivationMode'> {
	emit(
		data: INodeExecutionData[][],
		responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>,
		donePromise?: IDeferredPromise<IRun>,
	): void;
	emitError(error: Error, responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>): void;
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;
	helpers: RequestHelperFunctions &
		BaseHelperFunctions &
		BinaryHelperFunctions &
		SSHTunnelFunctions &
		SchedulingFunctions;
}
// end ITriggerFunctions

// interfacedeclaration: ITriggerResponse
export interface ITriggerResponse {
	closeFunction?: CloseFunction;
	// To manually trigger the run
	manualTriggerFunction?: () => Promise<void>;
	// Gets added automatically at manual workflow runs resolves with
	// the first emitted data
	manualTriggerResponse?: Promise<INodeExecutionData[][]>;
}
// end ITriggerResponse

// interfacedeclaration: IDeferredPromise
export interface IDeferredPromise<T> {
	promise: Promise<T>;
	resolve: ResolveFn<T>;
	reject: RejectFn;
}
// end IDeferredPromise

// interfacedeclaration: IRun
export interface IRun {
	data: IRunExecutionData;
	/**
	 * @deprecated Use status instead
	 */
	finished?: boolean;
	mode: WorkflowExecuteMode;
	waitTill?: Date | null;
	startedAt: Date;
	stoppedAt?: Date;
	status: ExecutionStatus;
}
// end IRun

// variabledeclaration: deepCopy
deepCopy = <T extends ((object | Date) & { toJSON?: () => string }) | Primitives>(
	source: T,
	hash = new WeakMap(),
	path = '',
): T => {
	const hasOwnProp = Object.prototype.hasOwnProperty.bind(source);
	// Primitives & Null & Function
	if (typeof source !== 'object' || source === null || typeof source === 'function') {
		return source;
	}
	// Date and other objects with toJSON method
	// TODO: remove this when other code parts not expecting objects with `.toJSON` method called and add back checking for Date and cloning it properly
	if (typeof source.toJSON === 'function') {
		return source.toJSON() as T;
	}
	if (hash.has(source)) {
		return hash.get(source);
	}
	// Array
	if (Array.isArray(source)) {
		const clone = [];
		const len = source.length;
		for (let i = 0; i < len; i++) {
			clone[i] = deepCopy(source[i], hash, path + `[${i}]`);
		}
		return clone as T;
	}
	// Object
	const clone = Object.create(Object.getPrototypeOf({}));
	hash.set(source, clone);
	for (const i in source) {
		if (hasOwnProp(i)) {
			clone[i] = deepCopy((source as any)[i], hash, path + `.${i}`);
		}
	}
	return clone;
}
// end deepCopy

// type: NodeExecutionWithMetadata
export interface NodeExecutionWithMetadata extends INodeExecutionData {
	pairedItem: IPairedItemData | IPairedItemData[];
}
// end NodeExecutionWithMetadata

// function: updateDisplayOptions
export function updateDisplayOptions(
	displayOptions: IDisplayOptions,
	properties: INodeProperties[],
) {
	return properties.map((nodeProperty) => {
		return {
			...nodeProperty,
			displayOptions: merge({}, nodeProperty.displayOptions, displayOptions),
		};
	});
}
// end updateDisplayOptions

// interfacedeclaration: IN8nHttpFullResponse
export interface IN8nHttpFullResponse {
	body: IN8nHttpResponse | Readable;
	__bodyResolved?: boolean;
	headers: IDataObject;
	statusCode: number;
	statusMessage?: string;
}
// end IN8nHttpFullResponse

// type: NodeParameterValue
export type NodeParameterValue = string | number | boolean | undefined | null;
// end NodeParameterValue

// function: assert
export function assert<T>(condition: T, msg?: string): asserts condition {
	if (!condition) {
		const error = new Error(msg ?? 'Invalid assertion');
		// hide assert stack frame if supported
		if (Error.hasOwnProperty('captureStackTrace')) {
			// V8 only - https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
			Error.captureStackTrace(error, assert);
		} else if (error.stack) {
			// fallback for IE and Firefox
			error.stack = error.stack
				.split('\n')
				.slice(1) // skip assert function from stack frames
				.join('\n');
		}
		throw error;
	}
}
// end assert

// interfacedeclaration: INodeParameters
export interface INodeParameters {
	[key: string]: NodeParameterValueType;
}
// end INodeParameters

// typealiasdeclaration: Entity
export type Entity<M, K> = K extends keyof M ? { resource: K; operation: M[K] } : never;
// end Entity

// typealiasdeclaration: PropertiesOf
export type PropertiesOf<M extends { resource: string; operation: string }> = Array<
	Omit<INodeProperties, 'displayOptions'> & {
		displayOptions?: {
			[key in 'show' | 'hide']?: {
				resource?: Array<M['resource']>;
				operation?: Array<M['operation']>;
				[otherKey: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
			};
		};
	}
>;
// end PropertiesOf

// interfacedeclaration: IOAuth2Options
export interface IOAuth2Options {
	includeCredentialsOnRefreshOnBody?: boolean;
	property?: string;
	tokenType?: string;
	keepBearer?: boolean;
	tokenExpiredStatusCode?: number;
	keyToIncludeInAccessTokenHeader?: string;
}
// end IOAuth2Options

// typealiasdeclaration: GenericValue
export type GenericValue = string | object | number | boolean | undefined | null;
// end GenericValue

// type: CodeExecutionMode
export type CodeExecutionMode = (typeof CODE_EXECUTION_MODES)[number];
// end CodeExecutionMode

// type: CodeNodeEditorLanguage
export type CodeNodeEditorLanguage = (typeof CODE_LANGUAGES)[number];
// end CodeNodeEditorLanguage

// type: WorkflowExecuteMode
export type WorkflowExecuteMode =
	| 'cli'
	| 'error'
	| 'integrated'
	| 'internal'
	| 'manual'
	| 'retry'
	| 'trigger'
	| 'webhook'
	| 'evaluation';
// end WorkflowExecuteMode

// typealiasdeclaration: ISupplyDataFunctions
export type ISupplyDataFunctions = ExecuteFunctions.GetNodeParameterFn &
	FunctionsBaseWithRequiredKeys<'getMode'> &
	Pick<
		IExecuteFunctions,
		| 'addInputData'
		| 'addOutputData'
		| 'getInputConnectionData'
		| 'getInputData'
		| 'getNodeOutputs'
		| 'executeWorkflow'
		| 'sendMessageToUI'
		| 'helpers'
	> & {
		getNextRunIndex(): number;
		continueOnFail(): boolean;
		evaluateExpression(expression: string, itemIndex: number): NodeParameterValueType;
		getWorkflowDataProxy(itemIndex: number): IWorkflowDataProxyData;
		getExecutionCancelSignal(): AbortSignal | undefined;
		onExecutionCancellation(handler: () => unknown): void;
		logAiEvent(eventName: AiEvent, msg?: string | undefined): void;
		cloneWith(replacements: {
			runIndex: number;
			inputData: INodeExecutionData[][];
		}): ISupplyDataFunctions;
	};
// end ISupplyDataFunctions

// interfacedeclaration: IWorkflowDataProxyData
export interface IWorkflowDataProxyData {
	[key: string]: any;
	$binary: INodeExecutionData['binary'];
	$data: any;
	$env: any;
	$evaluateExpression: (expression: string, itemIndex?: number) => NodeParameterValueType;
	$item: (itemIndex: number, runIndex?: number) => IWorkflowDataProxyData;
	$items: (nodeName?: string, outputIndex?: number, runIndex?: number) => INodeExecutionData[];
	$json: INodeExecutionData['json'];
	$node: any;
	$parameter: INodeParameters;
	$position: number;
	$workflow: any;
	$: any;
	$input: ProxyInput;
	$thisItem: any;
	$thisRunIndex: number;
	$thisItemIndex: number;
	$now: any;
	$today: any;
	$getPairedItem: (
		destinationNodeName: string,
		incomingSourceData: ISourceData | null,
		pairedItem: IPairedItemData,
	) => INodeExecutionData | null;
	constructor: any;
}
// end IWorkflowDataProxyData

// variabledeclaration: createResultOk
createResultOk = <T>(data: T): ResultOk<T> => ({
	ok: true,
	result: data,
})
// end createResultOk

// typealiasdeclaration: TriggerTime
export type TriggerTime =
	| CustomTrigger
	| EveryMinute
	| EveryXMinutes
	| EveryHour
	| EveryXHours
	| EveryDay
	| EveryWeek
	| EveryMonth;
// end TriggerTime

// sourcefile: NodeHelpers
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { EXECUTE_WORKFLOW_NODE_TYPE, WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE } from './constants';
import { ApplicationError } from './errors/application.error';
import { NodeConnectionTypes } from './interfaces';
import type {
	FieldType,
	IContextObject,
	INode,
	INodeCredentialDescription,
	INodeIssueObjectProperty,
	INodeIssues,
	INodeParameterResourceLocator,
	INodeParameters,
	INodeProperties,
	INodePropertyCollection,
	INodePropertyMode,
	INodePropertyModeValidation,
	INodePropertyOptions,
	INodePropertyRegexValidation,
	INodeType,
	IParameterDependencies,
	IRunExecutionData,
	IVersionedNodeType,
	NodeParameterValue,
	ResourceMapperValue,
	INodeTypeDescription,
	INodeOutputConfiguration,
	INodeInputConfiguration,
	GenericValue,
	DisplayCondition,
	NodeConnectionType,
} from './interfaces';
import { validateFilterParameter } from './node-parameters/filter-parameter';
import {
	isFilterValue,
	isINodePropertyOptionsList,
	isResourceLocatorValue,
	isResourceMapperValue,
	isValidResourceLocatorParameterValue,
} from './type-guards';
import { validateFieldType } from './type-validation';
import { deepCopy } from './utils';
import type { Workflow } from './workflow';

export const cronNodeOptions: INodePropertyCollection[] = [
	{
		name: 'item',
		displayName: 'Item',
		values: [
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Every Minute',
						value: 'everyMinute',
					},
					{
						name: 'Every Hour',
						value: 'everyHour',
					},
					{
						name: 'Every Day',
						value: 'everyDay',
					},
					{
						name: 'Every Week',
						value: 'everyWeek',
					},
					{
						name: 'Every Month',
						value: 'everyMonth',
					},
					{
						name: 'Every X',
						value: 'everyX',
					},
					{
						name: 'Custom',
						value: 'custom',
					},
				],
				default: 'everyDay',
				description: 'How often to trigger.',
			},
			{
				displayName: 'Hour',
				name: 'hour',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 23,
				},
				displayOptions: {
					hide: {
						mode: ['custom', 'everyHour', 'everyMinute', 'everyX'],
					},
				},
				default: 14,
				description: 'The hour of the day to trigger (24h format)',
			},
			{
				displayName: 'Minute',
				name: 'minute',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 59,
				},
				displayOptions: {
					hide: {
						mode: ['custom', 'everyMinute', 'everyX'],
					},
				},
				default: 0,
				description: 'The minute of the day to trigger',
			},
			{
				displayName: 'Day of Month',
				name: 'dayOfMonth',
				type: 'number',
				displayOptions: {
					show: {
						mode: ['everyMonth'],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 31,
				},
				default: 1,
				description: 'The day of the month to trigger',
			},
			{
				displayName: 'Weekday',
				name: 'weekday',
				type: 'options',
				displayOptions: {
					show: {
						mode: ['everyWeek'],
					},
				},
				options: [
					{
						name: 'Monday',
						value: '1',
					},
					{
						name: 'Tuesday',
						value: '2',
					},
					{
						name: 'Wednesday',
						value: '3',
					},
					{
						name: 'Thursday',
						value: '4',
					},
					{
						name: 'Friday',
						value: '5',
					},
					{
						name: 'Saturday',
						value: '6',
					},
					{
						name: 'Sunday',
						value: '0',
					},
				],
				default: '1',
				description: 'The weekday to trigger',
			},
			{
				displayName: 'Cron Expression',
				name: 'cronExpression',
				type: 'string',
				displayOptions: {
					show: {
						mode: ['custom'],
					},
				},
				default: '* * * * * *',
				description:
					'Use custom cron expression. Values and ranges as follows:<ul><li>Seconds: 0-59</li><li>Minutes: 0 - 59</li><li>Hours: 0 - 23</li><li>Day of Month: 1 - 31</li><li>Months: 0 - 11 (Jan - Dec)</li><li>Day of Week: 0 - 6 (Sun - Sat)</li></ul>',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1000,
				},
				displayOptions: {
					show: {
						mode: ['everyX'],
					},
				},
				default: 2,
				description: 'All how many X minutes/hours it should trigger',
			},
			{
				displayName: 'Unit',
				name: 'unit',
				type: 'options',
				displayOptions: {
					show: {
						mode: ['everyX'],
					},
				},
				options: [
					{
						name: 'Minutes',
						value: 'minutes',
					},
					{
						name: 'Hours',
						value: 'hours',
					},
				],
				default: 'hours',
				description: 'If it should trigger all X minutes or hours',
			},
		],
	},
];

/**
 * Determines if the provided node type has any output types other than the main connection type.
 * @param typeDescription The node's type description to check.
 */
export function isSubNodeType(
	typeDescription: Pick<INodeTypeDescription, 'outputs'> | null,
): boolean {
	if (!typeDescription?.outputs || typeof typeDescription.outputs === 'string') {
		return false;
	}
	const outputTypes = getConnectionTypes(typeDescription.outputs);
	return outputTypes
		? outputTypes.filter((output) => output !== NodeConnectionTypes.Main).length > 0
		: false;
}

const getPropertyValues = (
	nodeValues: INodeParameters,
	propertyName: string,
	node: Pick<INode, 'typeVersion'> | null,
	nodeTypeDescription: INodeTypeDescription | null,
	nodeValuesRoot: INodeParameters,
) => {
	let value;
	if (propertyName.charAt(0) === '/') {
		// Get the value from the root of the node
		value = get(nodeValuesRoot, propertyName.slice(1));
	} else if (propertyName === '@version') {
		value = node?.typeVersion || 0;
	} else if (propertyName === '@tool') {
		value = nodeTypeDescription?.name.endsWith('Tool') ?? false;
	} else {
		// Get the value from current level
		value = get(nodeValues, propertyName);
	}

	if (value && typeof value === 'object' && '__rl' in value && value.__rl) {
		value = value.value;
	}

	if (!Array.isArray(value)) {
		return [value as NodeParameterValue];
	} else {
		return value as NodeParameterValue[];
	}
};

const checkConditions = (
	conditions: Array<NodeParameterValue | DisplayCondition>,
	actualValues: NodeParameterValue[],
) => {
	return conditions.some((condition) => {
		if (
			condition &&
			typeof condition === 'object' &&
			condition._cnd &&
			Object.keys(condition).length === 1
		) {
			const [key, targetValue] = Object.entries(condition._cnd)[0];

			return actualValues.every((propertyValue) => {
				if (key === 'eq') {
					return isEqual(propertyValue, targetValue);
				}
				if (key === 'not') {
					return !isEqual(propertyValue, targetValue);
				}
				if (key === 'gte') {
					return (propertyValue as number) >= targetValue;
				}
				if (key === 'lte') {
					return (propertyValue as number) <= targetValue;
				}
				if (key === 'gt') {
					return (propertyValue as number) > targetValue;
				}
				if (key === 'lt') {
					return (propertyValue as number) < targetValue;
				}
				if (key === 'between') {
					const { from, to } = targetValue as { from: number; to: number };
					return (propertyValue as number) >= from && (propertyValue as number) <= to;
				}
				if (key === 'includes') {
					return (propertyValue as string).includes(targetValue);
				}
				if (key === 'startsWith') {
					return (propertyValue as string).startsWith(targetValue);
				}
				if (key === 'endsWith') {
					return (propertyValue as string).endsWith(targetValue);
				}
				if (key === 'regex') {
					return new RegExp(targetValue as string).test(propertyValue as string);
				}
				if (key === 'exists') {
					return propertyValue !== null && propertyValue !== undefined && propertyValue !== '';
				}
				return false;
			});
		}

		return actualValues.includes(condition as NodeParameterValue);
	});
};

/**
 * Returns if the parameter should be displayed or not
 *
 * @param {INodeParameters} nodeValues The data on the node which decides if the parameter
 *                                    should be displayed
 * @param {(INodeProperties | INodeCredentialDescription)} parameter The parameter to check if it should be displayed
 * @param {INodeParameters} [nodeValuesRoot] The root node-parameter-data
 */
export function displayParameter(
	nodeValues: INodeParameters,
	parameter: INodeProperties | INodeCredentialDescription,
	node: Pick<INode, 'typeVersion'> | null, // Allow null as it does also get used by credentials and they do not have versioning yet
	nodeTypeDescription: INodeTypeDescription | null,
	nodeValuesRoot?: INodeParameters,
	displayKey: 'displayOptions' | 'disabledOptions' = 'displayOptions',
) {
	if (!parameter[displayKey]) {
		return true;
	}

	const { show, hide } = parameter[displayKey];

	nodeValuesRoot = nodeValuesRoot || nodeValues;

	if (show) {
		// All the defined rules have to match to display parameter
		for (const propertyName of Object.keys(show)) {
			const values = getPropertyValues(
				nodeValues,
				propertyName,
				node,
				nodeTypeDescription,
				nodeValuesRoot,
			);

			if (values.some((v) => typeof v === 'string' && v.charAt(0) === '=')) {
				return true;
			}

			if (values.length === 0 || !checkConditions(show[propertyName]!, values)) {
				return false;
			}
		}
	}

	if (hide) {
		// Any of the defined hide rules have to match to hide the parameter
		for (const propertyName of Object.keys(hide)) {
			const values = getPropertyValues(
				nodeValues,
				propertyName,
				node,
				nodeTypeDescription,
				nodeValuesRoot,
			);

			if (values.length !== 0 && checkConditions(hide[propertyName]!, values)) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Returns if the given parameter should be displayed or not considering the path
 * to the properties
 *
 * @param {INodeParameters} nodeValues The data on the node which decides if the parameter
 *                                    should be displayed
 * @param {(INodeProperties | INodeCredentialDescription)} parameter The parameter to check if it should be displayed
 * @param {string} path The path to the property
 */
export function displayParameterPath(
	nodeValues: INodeParameters,
	parameter: INodeProperties | INodeCredentialDescription,
	path: string,
	node: Pick<INode, 'typeVersion'> | null,
	nodeTypeDescription: INodeTypeDescription | null,
	displayKey: 'displayOptions' | 'disabledOptions' = 'displayOptions',
) {
	let resolvedNodeValues = nodeValues;
	if (path !== '') {
		resolvedNodeValues = get(nodeValues, path) as INodeParameters;
	}

	// Get the root parameter data
	let nodeValuesRoot = nodeValues;
	if (path && path.split('.').indexOf('parameters') === 0) {
		nodeValuesRoot = get(nodeValues, 'parameters') as INodeParameters;
	}

	return displayParameter(
		resolvedNodeValues,
		parameter,
		node,
		nodeTypeDescription,
		nodeValuesRoot,
		displayKey,
	);
}

/**
 * Returns the context data
 *
 * @param {IRunExecutionData} runExecutionData The run execution data
 * @param {string} type The data type. "node"/"flow"
 * @param {INode} [node] If type "node" is set the node to return the context of has to be supplied
 */
export function getContext(
	runExecutionData: IRunExecutionData,
	type: string,
	node?: INode,
): IContextObject {
	if (runExecutionData.executionData === undefined) {
		// TODO: Should not happen leave it for test now
		throw new ApplicationError('`executionData` is not initialized');
	}

	let key: string;
	if (type === 'flow') {
		key = 'flow';
	} else if (type === 'node') {
		if (node === undefined) {
			// @TODO: What does this mean?
			throw new ApplicationError(
				'The request data of context type "node" the node parameter has to be set!',
			);
		}
		key = `node:${node.name}`;
	} else {
		throw new ApplicationError('Unknown context type. Only `flow` and `node` are supported.', {
			extra: { contextType: type },
		});
	}

	if (runExecutionData.executionData.contextData[key] === undefined) {
		runExecutionData.executionData.contextData[key] = {};
	}

	return runExecutionData.executionData.contextData[key];
}

/**
 * Returns which parameters are dependent on which
 */
function getParameterDependencies(nodePropertiesArray: INodeProperties[]): IParameterDependencies {
	const dependencies: IParameterDependencies = {};

	for (const nodeProperties of nodePropertiesArray) {
		const { name, displayOptions } = nodeProperties;

		if (!dependencies[name]) {
			dependencies[name] = [];
		}

		if (!displayOptions) {
			// Does not have any dependencies
			continue;
		}

		for (const displayRule of Object.values(displayOptions)) {
			for (const parameterName of Object.keys(displayRule)) {
				if (!dependencies[name].includes(parameterName)) {
					if (parameterName.charAt(0) === '@') {
						// Is a special parameter so can be skipped
						continue;
					}
					dependencies[name].push(parameterName);
				}
			}
		}
	}

	return dependencies;
}

/**
 * Returns in which order the parameters should be resolved
 * to have the parameters available they depend on
 */
function getParameterResolveOrder(
	nodePropertiesArray: INodeProperties[],
	parameterDependencies: IParameterDependencies,
): number[] {
	const executionOrder: number[] = [];
	const indexToResolve = Array.from({ length: nodePropertiesArray.length }, (_, k) => k);
	const resolvedParameters: string[] = [];

	let index: number;
	let property: INodeProperties;

	let lastIndexLength = indexToResolve.length;
	let lastIndexReduction = -1;

	let iterations = 0;

	while (indexToResolve.length !== 0) {
		iterations += 1;

		index = indexToResolve.shift() as number;
		property = nodePropertiesArray[index];

		if (parameterDependencies[property.name].length === 0) {
			// Does not have any dependencies so simply add
			executionOrder.push(index);
			resolvedParameters.push(property.name);
			continue;
		}

		// Parameter has dependencies
		for (const dependency of parameterDependencies[property.name]) {
			if (!resolvedParameters.includes(dependency)) {
				if (dependency.charAt(0) === '/') {
					// Assume that root level dependencies are resolved
					continue;
				}
				// Dependencies for that parameter are still missing so
				// try to add again later
				indexToResolve.push(index);
				continue;
			}
		}

		// All dependencies got found so add
		executionOrder.push(index);
		resolvedParameters.push(property.name);

		if (indexToResolve.length < lastIndexLength) {
			lastIndexReduction = iterations;
		}

		if (iterations > lastIndexReduction + nodePropertiesArray.length) {
			throw new ApplicationError(
				'Could not resolve parameter dependencies. Max iterations reached! Hint: If `displayOptions` are specified in any child parameter of a parent `collection` or `fixedCollection`, remove the `displayOptions` from the child parameter.',
			);
		}
		lastIndexLength = indexToResolve.length;
	}

	return executionOrder;
}

type GetNodeParametersOptions = {
	onlySimpleTypes?: boolean;
	dataIsResolved?: boolean; // If nodeValues are already fully resolved (so that all default values got added already)
	nodeValuesRoot?: INodeParameters;
	parentType?: string;
	parameterDependencies?: IParameterDependencies;
};

/**
 * Returns the node parameter values. Depending on the settings it either just returns the none
 * default values or it applies all the default values.
 *
 * @param {INodeProperties[]} nodePropertiesArray The properties which exist and their settings
 * @param {INodeParameters} nodeValues The node parameter data
 * @param {boolean} returnDefaults If default values get added or only none default values returned
 * @param {boolean} returnNoneDisplayed If also values which should not be displayed should be returned
 * @param {GetNodeParametersOptions} options Optional properties
 */
// eslint-disable-next-line complexity
export function getNodeParameters(
	nodePropertiesArray: INodeProperties[],
	nodeValues: INodeParameters | null,
	returnDefaults: boolean,
	returnNoneDisplayed: boolean,
	node: Pick<INode, 'typeVersion'> | null,
	nodeTypeDescription: INodeTypeDescription | null,
	options?: GetNodeParametersOptions,
): INodeParameters | null {
	let { nodeValuesRoot, parameterDependencies } = options ?? {};
	const { onlySimpleTypes = false, dataIsResolved = false, parentType } = options ?? {};
	if (parameterDependencies === undefined) {
		parameterDependencies = getParameterDependencies(nodePropertiesArray);
	}

	// Get the parameter names which get used multiple times as for this
	// ones we have to always check which ones get displayed and which ones not
	const duplicateParameterNames: string[] = [];
	const parameterNames: string[] = [];
	for (const nodeProperties of nodePropertiesArray) {
		if (parameterNames.includes(nodeProperties.name)) {
			if (!duplicateParameterNames.includes(nodeProperties.name)) {
				duplicateParameterNames.push(nodeProperties.name);
			}
		} else {
			parameterNames.push(nodeProperties.name);
		}
	}

	const nodeParameters: INodeParameters = {};
	const nodeParametersFull: INodeParameters = {};

	let nodeValuesDisplayCheck = nodeParametersFull;
	if (!dataIsResolved && !returnNoneDisplayed) {
		nodeValuesDisplayCheck = getNodeParameters(
			nodePropertiesArray,
			nodeValues,
			true,
			true,
			node,
			nodeTypeDescription,
			{
				onlySimpleTypes: true,
				dataIsResolved: true,
				nodeValuesRoot,
				parentType,
				parameterDependencies,
			},
		) as INodeParameters;
	}

	nodeValuesRoot = nodeValuesRoot || nodeValuesDisplayCheck;

	// Go through the parameters in order of their dependencies
	const parameterIterationOrderIndex = getParameterResolveOrder(
		nodePropertiesArray,
		parameterDependencies,
	);

	for (const parameterIndex of parameterIterationOrderIndex) {
		const nodeProperties = nodePropertiesArray[parameterIndex];
		if (
			!nodeValues ||
			(nodeValues[nodeProperties.name] === undefined &&
				(!returnDefaults || parentType === 'collection'))
		) {
			// The value is not defined so go to the next
			continue;
		}

		if (
			!returnNoneDisplayed &&
			!displayParameter(
				nodeValuesDisplayCheck,
				nodeProperties,
				node,
				nodeTypeDescription,
				nodeValuesRoot,
			)
		) {
			if (!returnNoneDisplayed || !returnDefaults) {
				continue;
			}
		}

		if (!['collection', 'fixedCollection'].includes(nodeProperties.type)) {
			// Is a simple property so can be set as it is

			if (duplicateParameterNames.includes(nodeProperties.name)) {
				if (
					!displayParameter(
						nodeValuesDisplayCheck,
						nodeProperties,
						node,
						nodeTypeDescription,
						nodeValuesRoot,
					)
				) {
					continue;
				}
			}

			if (returnDefaults) {
				// Set also when it has the default value
				if (['boolean', 'number', 'options'].includes(nodeProperties.type)) {
					// Boolean, numbers and options are special as false and 0 are valid values
					// and should not be replaced with default value
					nodeParameters[nodeProperties.name] =
						nodeValues[nodeProperties.name] !== undefined
							? nodeValues[nodeProperties.name]
							: nodeProperties.default;
				} else if (
					nodeProperties.type === 'resourceLocator' &&
					typeof nodeProperties.default === 'object'
				) {
					nodeParameters[nodeProperties.name] =
						nodeValues[nodeProperties.name] !== undefined
							? nodeValues[nodeProperties.name]
							: { __rl: true, ...nodeProperties.default };
				} else {
					nodeParameters[nodeProperties.name] =
						nodeValues[nodeProperties.name] ?? nodeProperties.default;
				}
				nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
			} else if (
				(nodeValues[nodeProperties.name] !== nodeProperties.default &&
					typeof nodeValues[nodeProperties.name] !== 'object') ||
				(typeof nodeValues[nodeProperties.name] === 'object' &&
					!isEqual(nodeValues[nodeProperties.name], nodeProperties.default)) ||
				(nodeValues[nodeProperties.name] !== undefined && parentType === 'collection')
			) {
				// Set only if it is different to the default value
				nodeParameters[nodeProperties.name] = nodeValues[nodeProperties.name];
				nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
				continue;
			}
		}

		if (onlySimpleTypes) {
			// It is only supposed to resolve the simple types. So continue.
			continue;
		}

		// Is a complex property so check lower levels
		let tempValue: INodeParameters | null;
		if (nodeProperties.type === 'collection') {
			// Is collection

			if (
				nodeProperties.typeOptions !== undefined &&
				nodeProperties.typeOptions.multipleValues === true
			) {
				// Multiple can be set so will be an array

				// Return directly the values like they are
				if (nodeValues[nodeProperties.name] !== undefined) {
					nodeParameters[nodeProperties.name] = nodeValues[nodeProperties.name];
				} else if (returnDefaults) {
					// Does not have values defined but defaults should be returned
					if (Array.isArray(nodeProperties.default)) {
						nodeParameters[nodeProperties.name] = deepCopy(nodeProperties.default);
					} else {
						// As it is probably wrong for many nodes, do we keep on returning an empty array if
						// anything else than an array is set as default
						nodeParameters[nodeProperties.name] = [];
					}
				}
				nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
			} else if (nodeValues[nodeProperties.name] !== undefined) {
				// Has values defined so get them
				const tempNodeParameters = getNodeParameters(
					nodeProperties.options as INodeProperties[],
					nodeValues[nodeProperties.name] as INodeParameters,
					returnDefaults,
					returnNoneDisplayed,
					node,
					nodeTypeDescription,
					{
						onlySimpleTypes: false,
						dataIsResolved: false,
						nodeValuesRoot,
						parentType: nodeProperties.type,
					},
				);

				if (tempNodeParameters !== null) {
					nodeParameters[nodeProperties.name] = tempNodeParameters;
					nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
				}
			} else if (returnDefaults) {
				// Does not have values defined but defaults should be returned
				nodeParameters[nodeProperties.name] = deepCopy(nodeProperties.default);
				nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
			}
		} else if (nodeProperties.type === 'fixedCollection') {
			// Is fixedCollection

			const collectionValues: INodeParameters = {};
			let tempNodeParameters: INodeParameters;
			let tempNodePropertiesArray: INodeProperties[];
			let nodePropertyOptions: INodePropertyCollection | undefined;

			let propertyValues = nodeValues[nodeProperties.name];
			if (returnDefaults) {
				if (propertyValues === undefined) {
					propertyValues = deepCopy(nodeProperties.default);
				}
			}

			if (
				!returnDefaults &&
				nodeProperties.typeOptions?.multipleValues === false &&
				propertyValues &&
				Object.keys(propertyValues).length === 0
			) {
				// For fixedCollections, which only allow one value, it is important to still return
				// the empty object which indicates that a value got added, even if it does not have
				// anything set. If that is not done, the value would get lost.
				return nodeValues;
			}

			// Iterate over all collections
			for (const itemName of Object.keys(propertyValues || {})) {
				if (
					nodeProperties.typeOptions !== undefined &&
					nodeProperties.typeOptions.multipleValues === true
				) {
					// Multiple can be set so will be an array

					const tempArrayValue: INodeParameters[] = [];
					// Iterate over all items as it contains multiple ones
					for (const nodeValue of (propertyValues as INodeParameters)[
						itemName
					] as INodeParameters[]) {
						nodePropertyOptions = nodeProperties.options!.find(
							// eslint-disable-next-line @typescript-eslint/no-shadow
							(nodePropertyOptions) => nodePropertyOptions.name === itemName,
						) as INodePropertyCollection;

						if (nodePropertyOptions === undefined) {
							throw new ApplicationError('Could not find property option', {
								extra: { propertyOption: itemName, property: nodeProperties.name },
							});
						}

						tempNodePropertiesArray = nodePropertyOptions.values!;
						tempValue = getNodeParameters(
							tempNodePropertiesArray,
							nodeValue,
							returnDefaults,
							returnNoneDisplayed,
							node,
							nodeTypeDescription,
							{
								onlySimpleTypes: false,
								dataIsResolved: false,
								nodeValuesRoot,
								parentType: nodeProperties.type,
							},
						);
						if (tempValue !== null) {
							tempArrayValue.push(tempValue);
						}
					}
					collectionValues[itemName] = tempArrayValue;
				} else {
					// Only one can be set so is an object of objects
					tempNodeParameters = {};

					// Get the options of the current item
					// eslint-disable-next-line @typescript-eslint/no-shadow
					const nodePropertyOptions = nodeProperties.options!.find(
						(data) => data.name === itemName,
					);

					if (nodePropertyOptions !== undefined) {
						tempNodePropertiesArray = (nodePropertyOptions as INodePropertyCollection).values!;
						tempValue = getNodeParameters(
							tempNodePropertiesArray,
							(nodeValues[nodeProperties.name] as INodeParameters)[itemName] as INodeParameters,
							returnDefaults,
							returnNoneDisplayed,
							node,
							nodeTypeDescription,
							{
								onlySimpleTypes: false,
								dataIsResolved: false,
								nodeValuesRoot,
								parentType: nodeProperties.type,
							},
						);
						if (tempValue !== null) {
							Object.assign(tempNodeParameters, tempValue);
						}
					}

					if (Object.keys(tempNodeParameters).length !== 0) {
						collectionValues[itemName] = tempNodeParameters;
					}
				}
			}

			if (
				!returnDefaults &&
				nodeProperties.typeOptions?.multipleValues === false &&
				collectionValues &&
				Object.keys(collectionValues).length === 0 &&
				propertyValues &&
				propertyValues?.constructor.name === 'Object' &&
				Object.keys(propertyValues).length !== 0
			) {
				// For fixedCollections, which only allow one value, it is important to still return
				// the object with an empty collection property which indicates that a value got added
				// which contains all default values. If that is not done, the value would get lost.
				const returnValue = {} as INodeParameters;
				Object.keys(propertyValues || {}).forEach((value) => {
					returnValue[value] = {};
				});
				nodeParameters[nodeProperties.name] = returnValue;
			}

			if (Object.keys(collectionValues).length !== 0 || returnDefaults) {
				// Set only if value got found
				if (returnDefaults) {
					// Set also when it has the default value
					if (collectionValues === undefined) {
						nodeParameters[nodeProperties.name] = deepCopy(nodeProperties.default);
					} else {
						nodeParameters[nodeProperties.name] = collectionValues;
					}
					nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
				} else if (collectionValues !== nodeProperties.default) {
					// Set only if values got found and it is not the default
					nodeParameters[nodeProperties.name] = collectionValues;
					nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
				}
			}
		}
	}
	return nodeParameters;
}

/**
 * Returns the webhook path
 */
export function getNodeWebhookPath(
	workflowId: string,
	node: INode,
	path: string,
	isFullPath?: boolean,
	restartWebhook?: boolean,
): string {
	let webhookPath = '';
	if (restartWebhook === true) {
		return path;
	}
	if (node.webhookId === undefined) {
		webhookPath = `${workflowId}/${encodeURIComponent(node.name.toLowerCase())}/${path}`;
	} else {
		if (isFullPath === true) {
			return path;
		}
		webhookPath = `${node.webhookId}/${path}`;
	}
	return webhookPath;
}

/**
 * Returns the webhook URL
 */
export function getNodeWebhookUrl(
	baseUrl: string,
	workflowId: string,
	node: INode,
	path: string,
	isFullPath?: boolean,
): string {
	if ((path.startsWith(':') || path.includes('/:')) && node.webhookId) {
		// setting this to false to prefix the webhookId
		isFullPath = false;
	}
	if (path.startsWith('/')) {
		path = path.slice(1);
	}
	return `${baseUrl}/${getNodeWebhookPath(workflowId, node, path, isFullPath)}`;
}

export function getConnectionTypes(
	connections: Array<NodeConnectionType | INodeInputConfiguration | INodeOutputConfiguration>,
): NodeConnectionType[] {
	return connections
		.map((connection) => {
			if (typeof connection === 'string') {
				return connection;
			}
			return connection.type;
		})
		.filter((connection) => connection !== undefined);
}

export function getNodeInputs(
	workflow: Workflow,
	node: INode,
	nodeTypeData: INodeTypeDescription,
): Array<NodeConnectionType | INodeInputConfiguration> {
	if (Array.isArray(nodeTypeData?.inputs)) {
		return nodeTypeData.inputs;
	}

	// Calculate the outputs dynamically
	try {
		return (workflow.expression.getSimpleParameterValue(
			node,
			nodeTypeData.inputs,
			'internal',
			{},
		) || []) as NodeConnectionType[];
	} catch (e) {
		console.warn('Could not calculate inputs dynamically for node: ', node.name);
		return [];
	}
}

export function getNodeOutputs(
	workflow: Workflow,
	node: INode,
	nodeTypeData: INodeTypeDescription,
): Array<NodeConnectionType | INodeOutputConfiguration> {
	let outputs: Array<NodeConnectionType | INodeOutputConfiguration> = [];

	if (Array.isArray(nodeTypeData.outputs)) {
		outputs = nodeTypeData.outputs;
	} else {
		// Calculate the outputs dynamically
		try {
			outputs = (workflow.expression.getSimpleParameterValue(
				node,
				nodeTypeData.outputs,
				'internal',
				{},
			) || []) as NodeConnectionType[];
		} catch (e) {
			console.warn('Could not calculate outputs dynamically for node: ', node.name);
		}
	}

	if (node.onError === 'continueErrorOutput') {
		// Copy the data to make sure that we do not change the data of the
		// node type and so change the displayNames for all nodes in the flow
		outputs = deepCopy(outputs);
		if (outputs.length === 1) {
			// Set the displayName to "Success"
			if (typeof outputs[0] === 'string') {
				outputs[0] = {
					type: outputs[0],
				};
			}
			outputs[0].displayName = 'Success';
		}
		return [
			...outputs,
			{
				category: 'error',
				type: NodeConnectionTypes.Main,
				displayName: 'Error',
			},
		];
	}

	return outputs;
}

/**
 * Returns all the parameter-issues of the node
 *
 * @param {INodeProperties[]} nodePropertiesArray The properties of the node
 * @param {INode} node The data of the node
 */
export function getNodeParametersIssues(
	nodePropertiesArray: INodeProperties[],
	node: INode,
	nodeTypeDescription: INodeTypeDescription | null,
	pinDataNodeNames?: string[],
): INodeIssues | null {
	const foundIssues: INodeIssues = {};
	let propertyIssues: INodeIssues;

	if (node.disabled === true || pinDataNodeNames?.includes(node.name)) {
		// Ignore issues on disabled and pindata nodes
		return null;
	}

	for (const nodeProperty of nodePropertiesArray) {
		propertyIssues = getParameterIssues(
			nodeProperty,
			node.parameters,
			'',
			node,
			nodeTypeDescription,
		);
		mergeIssues(foundIssues, propertyIssues);
	}

	if (Object.keys(foundIssues).length === 0) {
		return null;
	}

	return foundIssues;
}

/*
 * Validates resource locator node parameters based on validation ruled defined in each parameter mode
 */
const validateResourceLocatorParameter = (
	value: INodeParameterResourceLocator,
	parameterMode: INodePropertyMode,
): string[] => {
	const valueToValidate = value?.value?.toString() || '';
	if (valueToValidate.startsWith('=')) {
		return [];
	}

	const validationErrors: string[] = [];
	// Each mode can have multiple validations specified
	if (parameterMode.validation) {
		for (const validation of parameterMode.validation) {
			if (validation && (validation as INodePropertyModeValidation).type === 'regex') {
				const regexValidation = validation as INodePropertyRegexValidation;
				const regex = new RegExp(`^${regexValidation.properties.regex}$`);

				if (!regex.test(valueToValidate)) {
					validationErrors.push(regexValidation.properties.errorMessage);
				}
			}
		}
	}

	return validationErrors;
};

/*
 * Validates resource mapper values based on service schema
 */
const validateResourceMapperParameter = (
	nodeProperties: INodeProperties,
	value: ResourceMapperValue,
	skipRequiredCheck = false,
): Record<string, string[]> => {
	// No issues to raise in automatic mapping mode, no user input to validate
	if (value.mappingMode === 'autoMapInputData') {
		return {};
	}

	const issues: Record<string, string[]> = {};
	let fieldWordSingular =
		nodeProperties.typeOptions?.resourceMapper?.fieldWords?.singular || 'Field';
	fieldWordSingular = fieldWordSingular.charAt(0).toUpperCase() + fieldWordSingular.slice(1);
	value.schema.forEach((field) => {
		const fieldValue = value.value ? value.value[field.id] : null;
		const key = `${nodeProperties.name}.${field.id}`;
		const fieldErrors: string[] = [];
		if (field.required && !skipRequiredCheck) {
			if (value.value === null || fieldValue === undefined) {
				const error = `${fieldWordSingular} "${field.id}" is required`;
				fieldErrors.push(error);
			}
		}
		if (!fieldValue?.toString().startsWith('=') && field.type) {
			const validationResult = validateFieldType(field.id, fieldValue, field.type, {
				valueOptions: field.options,
			});
			if (!validationResult.valid && validationResult.errorMessage) {
				fieldErrors.push(validationResult.errorMessage);
			}
		}
		if (fieldErrors.length > 0) {
			issues[key] = fieldErrors;
		}
	});
	return issues;
};

const validateParameter = (
	nodeProperties: INodeProperties,
	value: GenericValue,
	type: FieldType,
): string | undefined => {
	const nodeName = nodeProperties.name;
	const options = type === 'options' ? nodeProperties.options : undefined;

	if (!value?.toString().startsWith('=')) {
		const validationResult = validateFieldType(nodeName, value, type, {
			valueOptions: options as INodePropertyOptions[],
		});

		if (!validationResult.valid && validationResult.errorMessage) {
			return validationResult.errorMessage;
		}
	}

	return undefined;
};

/**
 * Adds an issue if the parameter is not defined
 *
 * @param {INodeIssues} foundIssues The already found issues
 * @param {INodeProperties} nodeProperties The properties of the node
 * @param {NodeParameterValue} value The value of the parameter
 */
function addToIssuesIfMissing(
	foundIssues: INodeIssues,
	nodeProperties: INodeProperties,
	value: NodeParameterValue | INodeParameterResourceLocator,
) {
	// TODO: Check what it really has when undefined
	if (
		(nodeProperties.type === 'string' && (value === '' || value === undefined)) ||
		(nodeProperties.type === 'multiOptions' && Array.isArray(value) && value.length === 0) ||
		(nodeProperties.type === 'dateTime' && (value === '' || value === undefined)) ||
		(nodeProperties.type === 'options' && (value === '' || value === undefined)) ||
		((nodeProperties.type === 'resourceLocator' || nodeProperties.type === 'workflowSelector') &&
			!isValidResourceLocatorParameterValue(value as INodeParameterResourceLocator))
	) {
		// Parameter is required but empty
		if (foundIssues.parameters === undefined) {
			foundIssues.parameters = {};
		}
		if (foundIssues.parameters[nodeProperties.name] === undefined) {
			foundIssues.parameters[nodeProperties.name] = [];
		}

		foundIssues.parameters[nodeProperties.name].push(
			`Parameter "${nodeProperties.displayName}" is required.`,
		);
	}
}

/**
 * Returns the parameter value
 *
 * @param {INodeParameters} nodeValues The values of the node
 * @param {string} parameterName The name of the parameter to return the value of
 * @param {string} path The path to the properties
 */
export function getParameterValueByPath(
	nodeValues: INodeParameters,
	parameterName: string,
	path: string,
) {
	return get(nodeValues, path ? `${path}.${parameterName}` : parameterName);
}

function isINodeParameterResourceLocator(value: unknown): value is INodeParameterResourceLocator {
	return typeof value === 'object' && value !== null && 'value' in value && 'mode' in value;
}

/**
 * Returns all the issues with the given node-values
 *
 * @param {INodeProperties} nodeProperties The properties of the node
 * @param {INodeParameters} nodeValues The values of the node
 * @param {string} path The path to the properties
 */
// eslint-disable-next-line complexity
export function getParameterIssues(
	nodeProperties: INodeProperties,
	nodeValues: INodeParameters,
	path: string,
	node: INode,
	nodeTypeDescription: INodeTypeDescription | null,
): INodeIssues {
	const foundIssues: INodeIssues = {};
	const isDisplayed = displayParameterPath(
		nodeValues,
		nodeProperties,
		path,
		node,
		nodeTypeDescription,
	);
	if (nodeProperties.required === true) {
		if (isDisplayed) {
			const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);

			if (
				// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
				nodeProperties.typeOptions !== undefined &&
				nodeProperties.typeOptions.multipleValues !== undefined
			) {
				// Multiple can be set so will be an array
				if (Array.isArray(value)) {
					for (const singleValue of value as NodeParameterValue[]) {
						addToIssuesIfMissing(foundIssues, nodeProperties, singleValue);
					}
				}
			} else {
				// Only one can be set so will be a single value
				addToIssuesIfMissing(foundIssues, nodeProperties, value as NodeParameterValue);
			}
		}
	}

	if (
		(nodeProperties.type === 'resourceLocator' || nodeProperties.type === 'workflowSelector') &&
		isDisplayed
	) {
		const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
		if (isINodeParameterResourceLocator(value)) {
			const mode = nodeProperties.modes?.find((option) => option.name === value.mode);
			if (mode) {
				const errors = validateResourceLocatorParameter(value, mode);
				errors.forEach((error) => {
					if (foundIssues.parameters === undefined) {
						foundIssues.parameters = {};
					}
					if (foundIssues.parameters[nodeProperties.name] === undefined) {
						foundIssues.parameters[nodeProperties.name] = [];
					}

					foundIssues.parameters[nodeProperties.name].push(error);
				});
			}
		}
	} else if (nodeProperties.type === 'resourceMapper' && isDisplayed) {
		const skipRequiredCheck = nodeProperties.typeOptions?.resourceMapper?.mode !== 'add';
		const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
		if (isResourceMapperValue(value)) {
			const issues = validateResourceMapperParameter(nodeProperties, value, skipRequiredCheck);
			if (Object.keys(issues).length > 0) {
				if (foundIssues.parameters === undefined) {
					foundIssues.parameters = {};
				}
				if (foundIssues.parameters[nodeProperties.name] === undefined) {
					foundIssues.parameters[nodeProperties.name] = [];
				}
				foundIssues.parameters = { ...foundIssues.parameters, ...issues };
			}
		}
	} else if (nodeProperties.type === 'filter' && isDisplayed) {
		const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
		if (isFilterValue(value)) {
			const issues = validateFilterParameter(nodeProperties, value);
			if (Object.keys(issues).length > 0) {
				foundIssues.parameters = { ...foundIssues.parameters, ...issues };
			}
		}
	} else if (nodeProperties.validateType) {
		const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
		const error = validateParameter(nodeProperties, value, nodeProperties.validateType);
		if (error) {
			if (foundIssues.parameters === undefined) {
				foundIssues.parameters = {};
			}
			if (foundIssues.parameters[nodeProperties.name] === undefined) {
				foundIssues.parameters[nodeProperties.name] = [];
			}

			foundIssues.parameters[nodeProperties.name].push(error);
		}
	}

	// Check if there are any child parameters
	if (nodeProperties.options === undefined) {
		// There are none so nothing else to check
		return foundIssues;
	}

	// Check the child parameters

	// Important:
	// Checks the child properties only if the property is defined on current level.
	// That means that the required flag works only for the current level only. If
	// it is set on a lower level it means that the property is only required in case
	// the parent property got set.

	let basePath = path ? `${path}.` : '';

	const checkChildNodeProperties: Array<{
		basePath: string;
		data: INodeProperties;
	}> = [];

	// Collect all the properties to check
	if (nodeProperties.type === 'collection') {
		for (const option of nodeProperties.options) {
			checkChildNodeProperties.push({
				basePath,
				data: option as INodeProperties,
			});
		}
	} else if (nodeProperties.type === 'fixedCollection' && isDisplayed) {
		basePath = basePath ? `${basePath}.` : `${nodeProperties.name}.`;

		let propertyOptions: INodePropertyCollection;
		for (propertyOptions of nodeProperties.options as INodePropertyCollection[]) {
			// Check if the option got set and if not skip it
			const value = getParameterValueByPath(
				nodeValues,
				propertyOptions.name,
				basePath.slice(0, -1),
			);

			// Validate allowed field counts
			const valueArray = Array.isArray(value) ? value : [];
			const { minRequiredFields, maxAllowedFields } = nodeProperties.typeOptions ?? {};
			let error = '';

			if (minRequiredFields && valueArray.length < minRequiredFields) {
				error = `At least ${minRequiredFields} ${minRequiredFields === 1 ? 'field is' : 'fields are'} required.`;
			}
			if (maxAllowedFields && valueArray.length > maxAllowedFields) {
				error = `At most ${maxAllowedFields} ${maxAllowedFields === 1 ? 'field is' : 'fields are'} allowed.`;
			}
			if (error) {
				foundIssues.parameters ??= {};
				foundIssues.parameters[nodeProperties.name] ??= [];
				foundIssues.parameters[nodeProperties.name].push(error);
			}

			if (value === undefined) {
				continue;
			}

			if (
				// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
				nodeProperties.typeOptions !== undefined &&
				nodeProperties.typeOptions.multipleValues !== undefined
			) {
				// Multiple can be set so will be an array of objects
				if (Array.isArray(value)) {
					for (let i = 0; i < (value as INodeParameters[]).length; i++) {
						for (const option of propertyOptions.values) {
							checkChildNodeProperties.push({
								basePath: `${basePath}${propertyOptions.name}[${i}]`,
								data: option,
							});
						}
					}
				}
			} else {
				// Only one can be set so will be an object
				for (const option of propertyOptions.values) {
					checkChildNodeProperties.push({
						basePath: basePath + propertyOptions.name,
						data: option,
					});
				}
			}
		}
	} else {
		// For all other types there is nothing to check so return
		return foundIssues;
	}

	let propertyIssues;

	for (const optionData of checkChildNodeProperties) {
		propertyIssues = getParameterIssues(
			optionData.data,
			nodeValues,
			optionData.basePath,
			node,
			nodeTypeDescription,
		);
		mergeIssues(foundIssues, propertyIssues);
	}

	return foundIssues;
}

/**
 * Merges multiple NodeIssues together
 *
 * @param {INodeIssues} destination The issues to merge into
 * @param {(INodeIssues | null)} source The issues to merge
 */
export function mergeIssues(destination: INodeIssues, source: INodeIssues | null) {
	if (source === null) {
		// Nothing to merge
		return;
	}

	if (source.execution === true) {
		destination.execution = true;
	}

	const objectProperties = ['parameters', 'credentials'];

	let destinationProperty: INodeIssueObjectProperty;
	for (const propertyName of objectProperties) {
		if (source[propertyName] !== undefined) {
			if (destination[propertyName] === undefined) {
				destination[propertyName] = {};
			}

			let parameterName: string;
			for (parameterName of Object.keys(source[propertyName] as INodeIssueObjectProperty)) {
				destinationProperty = destination[propertyName] as INodeIssueObjectProperty;
				if (destinationProperty[parameterName] === undefined) {
					destinationProperty[parameterName] = [];
				}
				destinationProperty[parameterName].push.apply(
					destinationProperty[parameterName],
					(source[propertyName] as INodeIssueObjectProperty)[parameterName],
				);
			}
		}
	}

	if (source.typeUnknown === true) {
		destination.typeUnknown = true;
	}
}

/**
 * Merges the given node properties
 */
export function mergeNodeProperties(
	mainProperties: INodeProperties[],
	addProperties: INodeProperties[],
): void {
	let existingIndex: number;
	for (const property of addProperties) {
		if (property.doNotInherit) continue;

		existingIndex = mainProperties.findIndex((element) => element.name === property.name);

		if (existingIndex === -1) {
			// Property does not exist yet, so add
			mainProperties.push(property);
		} else {
			// Property exists already, so overwrite
			mainProperties[existingIndex] = property;
		}
	}
}

export function getVersionedNodeType(
	object: IVersionedNodeType | INodeType,
	version?: number,
): INodeType {
	if ('nodeVersions' in object) {
		return object.getNodeType(version);
	}
	return object;
}

export function isTriggerNode(nodeTypeData: INodeTypeDescription) {
	return nodeTypeData.group.includes('trigger');
}

export function isExecutable(workflow: Workflow, node: INode, nodeTypeData: INodeTypeDescription) {
	const outputs = getNodeOutputs(workflow, node, nodeTypeData);
	const outputNames = getConnectionTypes(outputs);
	return (
		outputNames.includes(NodeConnectionTypes.Main) ||
		outputNames.includes(NodeConnectionTypes.AiTool) ||
		isTriggerNode(nodeTypeData)
	);
}

export function isNodeWithWorkflowSelector(node: INode) {
	return [EXECUTE_WORKFLOW_NODE_TYPE, WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE].includes(node.type);
}

/**
 * Generates a human-readable description for a node based on its parameters and type definition.
 *
 * This function creates a descriptive string that represents what the node does,
 * based on its resource, operation, and node type information. The description is
 * formatted in one of the following ways:
 *
 * 1. "{action} in {displayName}" if the operation has a defined action
 * 2. "{operation} {resource} in {displayName}" if resource and operation exist
 * 3. The node type's description field as a fallback
 */
export function makeDescription(
	nodeParameters: INodeParameters,
	nodeTypeDescription: INodeTypeDescription,
): string {
	let description = '';
	const resource = nodeParameters.resource as string;
	const operation = nodeParameters.operation as string;
	const nodeTypeOperation = nodeTypeDescription.properties.find(
		(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes(resource),
	);

	if (nodeTypeOperation?.options && isINodePropertyOptionsList(nodeTypeOperation.options)) {
		const foundOperation = nodeTypeOperation.options.find((option) => option.value === operation);
		if (foundOperation?.action) {
			description = `${foundOperation.action} in ${nodeTypeDescription.defaults.name}`;
			return description;
		}
	}

	if (!description && resource && operation) {
		description = `${operation} ${resource} in ${nodeTypeDescription.defaults.name}`;
	} else {
		description = nodeTypeDescription.description;
	}

	return description;
}

/**
 * Determines whether a tool description should be updated and returns the new description if needed.
 * Returns undefined if no update is needed.
 */

export const getUpdatedToolDescription = (
	currentNodeType: INodeTypeDescription | null,
	newParameters: INodeParameters | null,
	currentParameters?: INodeParameters,
) => {
	if (!currentNodeType) return;

	if (newParameters?.descriptionType === 'manual' && currentParameters) {
		const previousDescription = makeDescription(currentParameters, currentNodeType);
		const newDescription = makeDescription(newParameters, currentNodeType);

		if (
			newParameters.toolDescription === previousDescription ||
			!newParameters.toolDescription?.toString().trim() ||
			newParameters.toolDescription === currentNodeType.description
		) {
			return newDescription;
		}
	}

	return;
};

/**
 * Generates a tool description for a given node based on its parameters and type.
 */
export function getToolDescriptionForNode(node: INode, nodeType: INodeType): string {
	let toolDescription;
	if (
		node.parameters.descriptionType === 'auto' ||
		!node?.parameters.toolDescription?.toString().trim()
	) {
		toolDescription = makeDescription(node.parameters, nodeType.description);
	} else if (node?.parameters.toolDescription) {
		toolDescription = node.parameters.toolDescription;
	} else {
		toolDescription = nodeType.description.description;
	}
	return toolDescription as string;
}

/**
 * Attempts to retrieve the ID of a subworkflow from a execute workflow node.
 */
export function getSubworkflowId(node: INode): string | undefined {
	if (isNodeWithWorkflowSelector(node) && isResourceLocatorValue(node.parameters.workflowId)) {
		return node.parameters.workflowId.value as string;
	}
	return;
}

// end NodeHelpers

// variabledeclaration: toCronExpression
toCronExpression = (item: TriggerTime): CronExpression => {
	const randomSecond = randomInt(60);

	if (item.mode === 'everyMinute') return `${randomSecond} * * * * *`;
	if (item.mode === 'everyHour') return `${randomSecond} ${item.minute} * * * *`;

	if (item.mode === 'everyX') {
		if (item.unit === 'minutes') return `${randomSecond} */${item.value} * * * *`;

		const randomMinute = randomInt(60);
		if (item.unit === 'hours') return `${randomSecond} ${randomMinute} */${item.value} * * *`;
	}
	if (item.mode === 'everyDay') return `${randomSecond} ${item.minute} ${item.hour} * * *`;
	if (item.mode === 'everyWeek')
		return `${randomSecond} ${item.minute} ${item.hour} * * ${item.weekday}`;

	if (item.mode === 'everyMonth')
		return `${randomSecond} ${item.minute} ${item.hour} ${item.dayOfMonth} * *`;

	return item.cronExpression.trim() as CronExpression;
}
// end toCronExpression

// variabledeclaration: SEND_AND_WAIT_OPERATION
SEND_AND_WAIT_OPERATION = 'sendAndWait'
// end SEND_AND_WAIT_OPERATION

// variabledeclaration: sleep
sleep = async (ms: number): Promise<void> =>
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	})
// end sleep

// classdeclaration: TriggerCloseError
export class TriggerCloseError extends ApplicationError {
	constructor(
		readonly node: INode,
		{ cause, level }: TriggerCloseErrorOptions,
	) {
		super('Trigger Close Failed', { cause, extra: { nodeName: node.name } });
		this.level = level;
	}
}
// end TriggerCloseError

// type: AssignmentCollectionValue
export type AssignmentCollectionValue = {
	assignments: AssignmentValue[];
};
// end AssignmentCollectionValue

// type: INodeTypes
export interface INodeTypes {
	getByName(nodeType: string): INodeType | IVersionedNodeType;
	getByNameAndVersion(nodeType: string, version?: number): INodeType;
	getKnownTypes(): IDataObject;
}
// end INodeTypes

// classdeclaration: UserError
export class UserError extends BaseError {
	readonly description: string | null | undefined;

	constructor(message: string, opts: UserErrorOptions = {}) {
		opts.level = opts.level ?? 'info';

		super(message, opts);
	}
}
// end UserError

// function: parseErrorMetadata
export function parseErrorMetadata(error: unknown): ISubWorkflowMetadata | undefined {
	if (hasKey(error, 'errorResponse')) {
		return parseErrorResponseWorkflowMetadata(error.errorResponse);
	}

	// This accounts for cases where the backend attaches the properties on plain errors
	// e.g. from custom nodes throwing literal `Error` or `ApplicationError` objects directly
	return parseErrorResponseWorkflowMetadata(error);
}
// end parseErrorMetadata

// interfacedeclaration: ExecuteWorkflowData
export interface ExecuteWorkflowData {
	executionId: string;
	data: Array<INodeExecutionData[] | null>;
	waitTill?: Date | null;
}
// end ExecuteWorkflowData

// interfacedeclaration: IExecuteWorkflowInfo
export interface IExecuteWorkflowInfo {
	code?: IWorkflowBase;
	id?: string;
}
// end IExecuteWorkflowInfo

// interfacedeclaration: INodeParameterResourceLocator
export interface INodeParameterResourceLocator {
	__rl: true;
	mode: ResourceLocatorModes;
	value: NodeParameterValue;
	cachedResultName?: string;
	cachedResultUrl?: string;
	__regex?: string;
}
// end INodeParameterResourceLocator

// interfacedeclaration: ILocalLoadOptionsFunctions
export interface ILocalLoadOptionsFunctions {
	getWorkflowNodeContext(nodeType: string): Promise<IWorkflowNodeContext | null>;
}
// end ILocalLoadOptionsFunctions

// typealiasdeclaration: FieldValueOption
export type FieldValueOption = { name: string; type: FieldType | 'any' };
// end FieldValueOption

// typealiasdeclaration: FormFieldsParameter
export type FormFieldsParameter = Array<{
	fieldLabel: string;
	elementName?: string;
	fieldType?: string;
	requiredField?: boolean;
	fieldOptions?: { values: Array<{ option: string }> };
	multiselect?: boolean;
	multipleFiles?: boolean;
	acceptFileTypes?: string;
	formatDate?: string;
	html?: string;
	placeholder?: string;
	fieldName?: string;
	fieldValue?: string;
}>;
// end FormFieldsParameter

// typealiasdeclaration: NodeTypeAndVersion
export type NodeTypeAndVersion = {
	name: string;
	type: string;
	typeVersion: number;
	disabled: boolean;
	parameters?: INodeParameters;
};
// end NodeTypeAndVersion

// classdeclaration: Node
export abstract class Node {
	abstract description: INodeTypeDescription;
	execute?(context: IExecuteFunctions): Promise<INodeExecutionData[][]>;
	webhook?(context: IWebhookFunctions): Promise<IWebhookResponseData>;
	poll?(context: IPollFunctions): Promise<INodeExecutionData[][] | null>;
}
// end Node

// variabledeclaration: FORM_NODE_TYPE
FORM_NODE_TYPE = 'n8n-nodes-base.form'
// end FORM_NODE_TYPE

// variabledeclaration: FORM_TRIGGER_NODE_TYPE
FORM_TRIGGER_NODE_TYPE = 'n8n-nodes-base.formTrigger'
// end FORM_TRIGGER_NODE_TYPE

// variabledeclaration: tryToParseJsonToFormFields
tryToParseJsonToFormFields = (value: unknown): FormFieldsParameter => {
	const fields: FormFieldsParameter = [];

	try {
		const rawFields = jsonParse<Array<{ [key: string]: unknown }>>(value as string, {
			acceptJSObject: true,
		});

		for (const [index, field] of rawFields.entries()) {
			for (const key of Object.keys(field)) {
				if (!ALLOWED_FORM_FIELDS_KEYS.includes(key)) {
					throw new ApplicationError(`Key '${key}' in field ${index} is not valid for form fields`);
				}
				if (
					key !== 'fieldOptions' &&
					!['string', 'number', 'boolean'].includes(typeof field[key])
				) {
					field[key] = String(field[key]);
				} else if (typeof field[key] === 'string') {
					field[key] = field[key].replace(/</g, '&lt;').replace(/>/g, '&gt;');
				}

				if (key === 'fieldType' && !ALLOWED_FIELD_TYPES.includes(field[key] as string)) {
					throw new ApplicationError(
						`Field type '${field[key] as string}' in field ${index} is not valid for form fields`,
					);
				}

				if (key === 'fieldOptions') {
					if (Array.isArray(field[key])) {
						field[key] = { values: field[key] };
					}

					if (
						typeof field[key] !== 'object' ||
						!(field[key] as { [key: string]: unknown }).values
					) {
						throw new ApplicationError(
							`Field dropdown in field ${index} does has no 'values' property that contain an array of options`,
						);
					}

					for (const [optionIndex, option] of (
						(field[key] as { [key: string]: unknown }).values as Array<{
							[key: string]: { option: string };
						}>
					).entries()) {
						if (Object.keys(option).length !== 1 || typeof option.option !== 'string') {
							throw new ApplicationError(
								`Field dropdown in field ${index} has an invalid option ${optionIndex}`,
							);
						}
					}
				}
			}

			fields.push(field as FormFieldsParameter[number]);
		}
	} catch (error) {
		if (error instanceof ApplicationError) throw error;

		throw new ApplicationError('Value is not valid JSON');
	}

	return fields;
}
// end tryToParseJsonToFormFields

// classdeclaration: OperationalError
export class OperationalError extends BaseError {
	constructor(message: string, opts: OperationalErrorOptions = {}) {
		opts.level = opts.level ?? 'warning';

		super(message, opts);
	}
}
// end OperationalError

// moduledeclaration: MultiPartFormData
export namespace MultiPartFormData {
	export interface File {
		filepath: string;
		mimetype?: string;
		originalFilename?: string;
		newFilename: string;
		size?: number;
	}

	export type Request = express.Request<
		{},
		{},
		{
			data: Record<string, string | string[]>;
			files: Record<string, File | File[]>;
		}
	>;
}
// end MultiPartFormData

// variabledeclaration: WAIT_NODE_TYPE
WAIT_NODE_TYPE = 'n8n-nodes-base.wait'
// end WAIT_NODE_TYPE

// variabledeclaration: FORM_TRIGGER_PATH_IDENTIFIER
FORM_TRIGGER_PATH_IDENTIFIER = 'n8n-form'
// end FORM_TRIGGER_PATH_IDENTIFIER

// variabledeclaration: ADD_FORM_NOTICE
ADD_FORM_NOTICE = 'addFormPage'
// end ADD_FORM_NOTICE

// variabledeclaration: WAIT_INDEFINITELY
WAIT_INDEFINITELY = new Date('3000-01-01T00:00:00.000Z')
// end WAIT_INDEFINITELY

// moduledeclaration: DeclarativeRestApiSettings
export namespace DeclarativeRestApiSettings {
	// The type below might be extended
	// with new options that need to be parsed as expressions
	export type HttpRequestOptions = Override<
		IHttpRequestOptions,
		{ skipSslCertificateValidation?: string | boolean; url?: string }
	>;

	export type ResultOptions = {
		maxResults?: number | string;
		options: HttpRequestOptions;
		paginate?: boolean | string;
		preSend: PreSendAction[];
		postReceive: Array<{
			data: {
				parameterValue: string | IDataObject | undefined;
			};
			actions: PostReceiveAction[];
		}>;
		requestOperations?: IN8nRequestOperations;
	};
}
// end DeclarativeRestApiSettings

// interfacedeclaration: IExecutePaginationFunctions
export interface IExecutePaginationFunctions extends IExecuteSingleFunctions {
	makeRoutingRequest(
		this: IAllExecuteFunctions,
		requestOptions: DeclarativeRestApiSettings.ResultOptions,
	): Promise<INodeExecutionData[]>;
}
// end IExecutePaginationFunctions

// typealiasdeclaration: NodeExecutionHint
export type NodeExecutionHint = Omit<NodeHint, 'whenToDisplay' | 'displayCondition'>;
// end NodeExecutionHint

// function: isSafeObjectProperty
export function isSafeObjectProperty(property: string) {
	return !unsafeObjectProperties.has(property);
}
// end isSafeObjectProperty

// interfacedeclaration: IRequestOptionsSimplified
export interface IRequestOptionsSimplified {
	auth?: {
		username: string;
		password: string;
		sendImmediately?: boolean;
	};
	body: IDataObject;
	headers: IDataObject;
	qs: IDataObject;
}
// end IRequestOptionsSimplified

// function: randomString
export function randomString(length: number): string;
// end randomString

// function: setSafeObjectProperty
export function setSafeObjectProperty(
	target: Record<string, unknown>,
	property: string,
	value: unknown,
) {
	if (isSafeObjectProperty(property)) {
		target[property] = value;
	}
}
// end setSafeObjectProperty

// variabledeclaration: removeCircularRefs
removeCircularRefs = (obj: JsonObject, seen = new Set()) => {
	seen.add(obj);
	Object.entries(obj).forEach(([key, value]) => {
		if (isTraversableObject(value)) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			seen.has(value) ? (obj[key] = { circularReference: true }) : removeCircularRefs(value, seen);
			return;
		}
		if (Array.isArray(value)) {
			value.forEach((val, index) => {
				if (seen.has(val)) {
					value[index] = { circularReference: true };
					return;
				}
				if (isTraversableObject(val)) {
					removeCircularRefs(val, seen);
				}
			});
		}
	});
}
// end removeCircularRefs

// interfacedeclaration: PaginationOptions
export interface PaginationOptions {
	binaryResult?: boolean;
	continue: boolean | string;
	request: IRequestOptionsSimplifiedAuth;
	requestInterval: number;
	maxRequests?: number;
}
// end PaginationOptions

// typealiasdeclaration: Logger
export type Logger = Record<
	Exclude<LogLevel, 'silent'>,
	(message: string, metadata?: LogMetadata) => void
>;
// end Logger

// function: ensureError
export function ensureError(error: unknown): Error {
	return error instanceof Error
		? error
		: new Error('Error that was not an instance of Error was thrown', {
				// We should never throw anything except something that derives from Error
				cause: error,
			});
}
// end ensureError

// typealiasdeclaration: ResourceMapperValue
export type ResourceMapperValue = {
	mappingMode: string;
	value: { [key: string]: string | number | boolean | null } | null;
	matchingColumns: string[];
	schema: ResourceMapperField[];
	attemptToConvertTypes: boolean;
	convertFieldsToString: boolean;
};
// end ResourceMapperValue

// typealiasdeclaration: SSHCredentials
export type SSHCredentials = {
	sshHost: string;
	sshPort: number;
	sshUser: string;
} & (
	| {
			sshAuthenticateWith: 'password';
			sshPassword: string;
	  }
	| {
			sshAuthenticateWith: 'privateKey';
			// TODO: rename this to `sshPrivateKey`
			privateKey: string;
			// TODO: rename this to `sshPassphrase`
			passphrase?: string;
	  }
);
// end SSHCredentials

// typealiasdeclaration: PreSendAction
export type PreSendAction = (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
) => Promise<IHttpRequestOptions>;
// end PreSendAction

// interfacedeclaration: IDisplayOptions
export interface IDisplayOptions {
	hide?: {
		[key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
	};
	show?: {
		'@version'?: Array<number | DisplayCondition>;
		'@tool'?: boolean[];
		[key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
	};

	hideOnCloud?: boolean;
}
// end IDisplayOptions

// function: randomInt
export function randomInt(max: number): number;
// end randomInt

// typealiasdeclaration: NodeParameterValueType
export type NodeParameterValueType =
	// TODO: Later also has to be possible to add multiple ones with the name name. So array has to be possible
	| NodeParameterValue
	| INodeParameters
	| INodeParameterResourceLocator
	| ResourceMapperValue
	| FilterValue
	| AssignmentCollectionValue
	| NodeParameterValue[]
	| INodeParameters[]
	| INodeParameterResourceLocator[]
	| ResourceMapperValue[];
// end NodeParameterValueType

// interfacedeclaration: INodePropertyCollection
export interface INodePropertyCollection {
	displayName: string;
	name: string;
	values: INodeProperties[];
}
// end INodePropertyCollection

// typealiasdeclaration: IExecuteResponsePromiseData
export type IExecuteResponsePromiseData = IDataObject | IN8nHttpFullResponse;
// end IExecuteResponsePromiseData

// typealiasdeclaration: IN8nHttpResponse
export type IN8nHttpResponse = IDataObject | Buffer | GenericValue | GenericValue[] | null;
// end IN8nHttpResponse

// variabledeclaration: WEBHOOK_NODE_TYPE
WEBHOOK_NODE_TYPE = 'n8n-nodes-base.webhook'
// end WEBHOOK_NODE_TYPE

// variabledeclaration: CHAT_TRIGGER_NODE_TYPE
CHAT_TRIGGER_NODE_TYPE = '@n8n/n8n-nodes-langchain.chatTrigger'
// end CHAT_TRIGGER_NODE_TYPE

// type: CronExpression
export type CronExpression =
	`${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit}`;
// end CronExpression

// variabledeclaration: getValueDescription
getValueDescription = <T>(value: T): string => {
	if (typeof value === 'object') {
		if (value === null) return "'null'";
		if (Array.isArray(value)) return 'array';
		return 'object';
	}

	return `'${String(value)}'`;
}
// end getValueDescription

// function: validateFieldType
export function validateFieldType<K extends FieldType>(
	fieldName: string,
	value: unknown,
	type: K,
	options?: ValidateFieldTypeOptions,
): ValidationResult<K>;
// end validateFieldType

// variabledeclaration: tryToParseDateTime
tryToParseDateTime = (value: unknown, defaultZone?: string): DateTime => {
	if (DateTime.isDateTime(value) && value.isValid) {
		// Ignore the defaultZone if the value is already a DateTime
		// because DateTime objects already contain the zone information
		return value;
	}

	if (value instanceof Date) {
		const fromJSDate = DateTime.fromJSDate(value, { zone: defaultZone });
		if (fromJSDate.isValid) {
			return fromJSDate;
		}
	}

	const dateString = String(value).trim();

	// Rely on luxon to parse different date formats
	const isoDate = DateTime.fromISO(dateString, { zone: defaultZone, setZone: true });
	if (isoDate.isValid) {
		return isoDate;
	}
	const httpDate = DateTime.fromHTTP(dateString, { zone: defaultZone, setZone: true });
	if (httpDate.isValid) {
		return httpDate;
	}
	const rfc2822Date = DateTime.fromRFC2822(dateString, { zone: defaultZone, setZone: true });
	if (rfc2822Date.isValid) {
		return rfc2822Date;
	}
	const sqlDate = DateTime.fromSQL(dateString, { zone: defaultZone, setZone: true });
	if (sqlDate.isValid) {
		return sqlDate;
	}

	const parsedDateTime = DateTime.fromMillis(Date.parse(dateString), { zone: defaultZone });
	if (parsedDateTime.isValid) {
		return parsedDateTime;
	}

	throw new ApplicationError('Value is not a valid date', { extra: { dateString } });
}
// end tryToParseDateTime

// typealiasdeclaration: DeduplicationScope
export type DeduplicationScope = 'node' | 'workflow';
// end DeduplicationScope

// interfacedeclaration: IWebhookDescription
export interface IWebhookDescription {
	[key: string]: IHttpRequestMethods | WebhookResponseMode | boolean | string | undefined;
	httpMethod: IHttpRequestMethods | string;
	isFullPath?: boolean;
	name: WebhookType;
	path: string;
	responseBinaryPropertyName?: string;
	responseContentType?: string;
	responsePropertyName?: string;
	responseMode?: WebhookResponseMode | string;
	responseData?: WebhookResponseData | string;
	restartWebhook?: boolean;
	nodeType?: 'webhook' | 'form' | 'mcp';
	ndvHideUrl?: string | boolean; // If true the webhook will not be displayed in the editor
	ndvHideMethod?: string | boolean; // If true the method will not be displayed in the editor
}
// end IWebhookDescription