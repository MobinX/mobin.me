// module: IDataObject
export interface IDataObject {
	[key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}
// end module: IDataObject


// module: IExecuteFunctions
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
// end module: IExecuteFunctions


// module: INodeExecutionData
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
// end module: INodeExecutionData


// module: INodeType
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
// end module: INodeType


// module: INodeTypeDescription
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
// end module: INodeTypeDescription


// module: NodeConnectionTypes
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
// end module: NodeConnectionTypes


// module: NodeOperationError
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
// end module: NodeOperationError


// module: IHttpRequestMethods
export type IHttpRequestMethods = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';
// end module: IHttpRequestMethods


// module: ILoadOptionsFunctions
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
// end module: ILoadOptionsFunctions


// module: IRequestOptions
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
// end module: IRequestOptions


// module: INodeProperties
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
// end module: INodeProperties


// module: INodePropertyOptions
export interface INodePropertyOptions {
	name: string;
	value: string | number | boolean;
	action?: string;
	description?: string;
	routing?: INodePropertyRouting;
	outputConnectionType?: NodeConnectionType;
	inputSchema?: any;
}
// end module: INodePropertyOptions


// module: IHookFunctions
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
// end module: IHookFunctions


// module: IWebhookFunctions
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
// end module: IWebhookFunctions


// module: IWebhookResponseData
export interface IWebhookResponseData {
	workflowData?: INodeExecutionData[][];
	webhookResponse?: any;
	noWebhookResponse?: boolean;
}
// end module: IWebhookResponseData


// module: JsonObject
export type JsonObject = { [key: string]: JsonValue };
// end module: JsonObject


// module: NodeApiError
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
// end module: NodeApiError


// module: IExecuteSingleFunctions
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
// end module: IExecuteSingleFunctions


// module: IHttpRequestOptions
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
// end module: IHttpRequestOptions


// module: BINARY_ENCODING
BINARY_ENCODING = 'base64'
// end module: BINARY_ENCODING


// module: jsonParse
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
// end module: jsonParse


// module: AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT
AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT = 'codeGeneratedForPrompt'
// end module: AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT


// module: AI_TRANSFORM_JS_CODE
AI_TRANSFORM_JS_CODE = 'jsCode'
// end module: AI_TRANSFORM_JS_CODE


// module: ICredentialTestFunctions
export interface ICredentialTestFunctions {
	logger: Logger;
	helpers: SSHTunnelFunctions & {
		request: (uriOrObject: string | object, options?: object) => Promise<any>;
	};
}
// end module: ICredentialTestFunctions


// module: INodeCredentialTestResult
export interface INodeCredentialTestResult {
	status: 'OK' | 'Error';
	message: string;
}
// end module: INodeCredentialTestResult


// module: ICredentialsDecrypted
export interface ICredentialsDecrypted<T extends object = ICredentialDataDecryptedObject> {
	id: string;
	name: string;
	type: string;
	data?: T;
	homeProject?: ProjectSharingData;
	sharedWithProjects?: ProjectSharingData[];
}
// end module: ICredentialsDecrypted


// module: ICredentialDataDecryptedObject
export interface ICredentialDataDecryptedObject {
	[key: string]: CredentialInformation;
}
// end module: ICredentialDataDecryptedObject


// module: ITriggerFunctions
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
// end module: ITriggerFunctions


// module: ITriggerResponse
export interface ITriggerResponse {
	closeFunction?: CloseFunction;
	// To manually trigger the run
	manualTriggerFunction?: () => Promise<void>;
	// Gets added automatically at manual workflow runs resolves with
	// the first emitted data
	manualTriggerResponse?: Promise<INodeExecutionData[][]>;
}
// end module: ITriggerResponse


// module: IDeferredPromise
export interface IDeferredPromise<T> {
	promise: Promise<T>;
	resolve: ResolveFn<T>;
	reject: RejectFn;
}
// end module: IDeferredPromise


// module: IRun
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
// end module: IRun


// module: deepCopy
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
// end module: deepCopy


// module: NodeExecutionWithMetadata
export interface NodeExecutionWithMetadata extends INodeExecutionData {
	pairedItem: IPairedItemData | IPairedItemData[];
}
// end module: NodeExecutionWithMetadata


// module: INodeParameters
export interface INodeParameters {
	[key: string]: NodeParameterValueType;
}
// end module: INodeParameters


// module: IOAuth2Options
export interface IOAuth2Options {
	includeCredentialsOnRefreshOnBody?: boolean;
	property?: string;
	tokenType?: string;
	keepBearer?: boolean;
	tokenExpiredStatusCode?: number;
	keyToIncludeInAccessTokenHeader?: string;
}
// end module: IOAuth2Options


// module: GenericValue
export type GenericValue = string | object | number | boolean | undefined | null;
// end module: GenericValue


// module: NodeParameterValue
export type NodeParameterValue = string | number | boolean | undefined | null;
// end module: NodeParameterValue


// module: IPollFunctions
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
// end module: IPollFunctions


// module: ApplicationError
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
// end module: ApplicationError


// module: IPairedItemData
export interface IPairedItemData {
	item: number;
	input?: number; // If undefined "0" gets used
	sourceOverwrite?: ISourceData;
}
// end module: IPairedItemData


// module: INodeListSearchResult
export interface INodeListSearchResult {
	results: INodeListSearchItems[];
	paginationToken?: unknown;
}
// end module: INodeListSearchResult


// module: ResourceMapperFields
export interface ResourceMapperFields {
	fields: ResourceMapperField[];
	emptyFieldsNotice?: string;
}
// end module: ResourceMapperFields


// module: IBinaryKeyData
export interface IBinaryKeyData {
	[key: string]: IBinaryData;
}
// end module: IBinaryKeyData


// module: randomString
export function randomString(minLength: number, maxLength?: number): string {
	const length = maxLength === undefined ? minLength : randomInt(minLength, maxLength + 1);
	return [...crypto.getRandomValues(new Uint32Array(length))]
		.map((byte) => ALPHABET[byte % ALPHABET.length])
		.join('');
}
// end module: randomString


// module: MultiPartFormData NOT FOUND


// module: Logger
export type Logger = Record<
	Exclude<LogLevel, 'silent'>,
	(message: string, metadata?: LogMetadata) => void
>;
// end module: Logger


// module: randomInt
export function randomInt(min: number, max?: number): number {
	if (max === undefined) {
		max = min;
		min = 0;
	}
	return min + (crypto.getRandomValues(new Uint32Array(1))[0] % (max - min));
}
// end module: randomInt


// module: IN8nHttpFullResponse
export interface IN8nHttpFullResponse {
	body: IN8nHttpResponse | Readable;
	__bodyResolved?: boolean;
	headers: IDataObject;
	statusCode: number;
	statusMessage?: string;
}
// end module: IN8nHttpFullResponse


// module: SEND_AND_WAIT_OPERATION
SEND_AND_WAIT_OPERATION = 'sendAndWait'
// end module: SEND_AND_WAIT_OPERATION
