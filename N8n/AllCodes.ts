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


// module: INodeTypeBaseDescription
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
// end module: INodeTypeBaseDescription


// module: IVersionedNodeType
export interface IVersionedNodeType {
	nodeVersions: {
		[key: number]: INodeType;
	};
	currentVersion: number;
	description: INodeTypeBaseDescription;
	getNodeType: (version?: number) => INodeType;
}
// end module: IVersionedNodeType


// module: VersionedNodeType
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
// end module: VersionedNodeType


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


// module: WorkflowTestData
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
// end module: WorkflowTestData


// module: IGetNodeParameterOptions
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
// end module: IGetNodeParameterOptions


// module: INode
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
// end module: INode


// module: IBinaryKeyData
export interface IBinaryKeyData {
	[key: string]: IBinaryData;
}
// end module: IBinaryKeyData


// module: IPairedItemData
export interface IPairedItemData {
	item: number;
	input?: number; // If undefined "0" gets used
	sourceOverwrite?: ISourceData;
}
// end module: IPairedItemData


// module: AllEntities
export type AllEntities<M> = M extends { [key: string]: string } ? Entity<M, keyof M> : never;
// end module: AllEntities


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


// module: INodeListSearchItems
export interface INodeListSearchItems extends INodePropertyOptions {
	icon?: string;
	url?: string;
}
// end module: INodeListSearchItems


// module: INodeListSearchResult
export interface INodeListSearchResult {
	results: INodeListSearchItems[];
	paginationToken?: unknown;
}
// end module: INodeListSearchResult


// module: FieldType
export type FieldType = keyof FieldTypeMap;
// end module: FieldType


// module: ResourceMapperField
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
// end module: ResourceMapperField


// module: ResourceMapperFields
export interface ResourceMapperFields {
	fields: ResourceMapperField[];
	emptyFieldsNotice?: string;
}
// end module: ResourceMapperFields


// module: IBinaryData
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
// end module: IBinaryData


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


// module: updateDisplayOptions
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
// end module: updateDisplayOptions


// module: IN8nHttpFullResponse
export interface IN8nHttpFullResponse {
	body: IN8nHttpResponse | Readable;
	__bodyResolved?: boolean;
	headers: IDataObject;
	statusCode: number;
	statusMessage?: string;
}
// end module: IN8nHttpFullResponse


// module: NodeParameterValue
export type NodeParameterValue = string | number | boolean | undefined | null;
// end module: NodeParameterValue


// module: assert
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
// end module: assert


// module: INodeParameters
export interface INodeParameters {
	[key: string]: NodeParameterValueType;
}
// end module: INodeParameters


// module: Entity
export type Entity<M, K> = K extends keyof M ? { resource: K; operation: M[K] } : never;
// end module: Entity


// module: PropertiesOf
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
// end module: PropertiesOf


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


// module: CodeExecutionMode
export type CodeExecutionMode = (typeof CODE_EXECUTION_MODES)[number];
// end module: CodeExecutionMode


// module: CodeNodeEditorLanguage
export type CodeNodeEditorLanguage = (typeof CODE_LANGUAGES)[number];
// end module: CodeNodeEditorLanguage


// module: WorkflowExecuteMode
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
// end module: WorkflowExecuteMode


// module: ISupplyDataFunctions
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
// end module: ISupplyDataFunctions


// module: IWorkflowDataProxyData
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
// end module: IWorkflowDataProxyData


// module: createResultOk
createResultOk = <T>(data: T): ResultOk<T> => ({
	ok: true,
	result: data,
})
// end module: createResultOk


// module: TriggerTime
export type TriggerTime =
	| CustomTrigger
	| EveryMinute
	| EveryXMinutes
	| EveryHour
	| EveryXHours
	| EveryDay
	| EveryWeek
	| EveryMonth;
// end module: TriggerTime


// module: NodeHelpers NOT FOUND


// module: toCronExpression
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
// end module: toCronExpression


// module: SEND_AND_WAIT_OPERATION
SEND_AND_WAIT_OPERATION = 'sendAndWait'
// end module: SEND_AND_WAIT_OPERATION


// module: sleep
sleep = async (ms: number): Promise<void> =>
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	})
// end module: sleep


// module: TriggerCloseError
export class TriggerCloseError extends ApplicationError {
	constructor(
		readonly node: INode,
		{ cause, level }: TriggerCloseErrorOptions,
	) {
		super('Trigger Close Failed', { cause, extra: { nodeName: node.name } });
		this.level = level;
	}
}
// end module: TriggerCloseError


// module: AssignmentCollectionValue
export type AssignmentCollectionValue = {
	assignments: AssignmentValue[];
};
// end module: AssignmentCollectionValue


// module: INodeTypes
export interface INodeTypes {
	getByName(nodeType: string): INodeType | IVersionedNodeType;
	getByNameAndVersion(nodeType: string, version?: number): INodeType;
	getKnownTypes(): IDataObject;
}
// end module: INodeTypes


// module: UserError
export class UserError extends BaseError {
	readonly description: string | null | undefined;

	constructor(message: string, opts: UserErrorOptions = {}) {
		opts.level = opts.level ?? 'info';

		super(message, opts);
	}
}
// end module: UserError


// module: parseErrorMetadata
export function parseErrorMetadata(error: unknown): ISubWorkflowMetadata | undefined {
	if (hasKey(error, 'errorResponse')) {
		return parseErrorResponseWorkflowMetadata(error.errorResponse);
	}

	// This accounts for cases where the backend attaches the properties on plain errors
	// e.g. from custom nodes throwing literal `Error` or `ApplicationError` objects directly
	return parseErrorResponseWorkflowMetadata(error);
}
// end module: parseErrorMetadata


// module: ExecuteWorkflowData
export interface ExecuteWorkflowData {
	executionId: string;
	data: Array<INodeExecutionData[] | null>;
	waitTill?: Date | null;
}
// end module: ExecuteWorkflowData


// module: IExecuteWorkflowInfo
export interface IExecuteWorkflowInfo {
	code?: IWorkflowBase;
	id?: string;
}
// end module: IExecuteWorkflowInfo


// module: INodeParameterResourceLocator
export interface INodeParameterResourceLocator {
	__rl: true;
	mode: ResourceLocatorModes;
	value: NodeParameterValue;
	cachedResultName?: string;
	cachedResultUrl?: string;
	__regex?: string;
}
// end module: INodeParameterResourceLocator


// module: ILocalLoadOptionsFunctions
export interface ILocalLoadOptionsFunctions {
	getWorkflowNodeContext(nodeType: string): Promise<IWorkflowNodeContext | null>;
}
// end module: ILocalLoadOptionsFunctions


// module: FieldValueOption
export type FieldValueOption = { name: string; type: FieldType | 'any' };
// end module: FieldValueOption


// module: FormFieldsParameter
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
// end module: FormFieldsParameter


// module: NodeTypeAndVersion
export type NodeTypeAndVersion = {
	name: string;
	type: string;
	typeVersion: number;
	disabled: boolean;
	parameters?: INodeParameters;
};
// end module: NodeTypeAndVersion


// module: Node
export abstract class Node {
	abstract description: INodeTypeDescription;
	execute?(context: IExecuteFunctions): Promise<INodeExecutionData[][]>;
	webhook?(context: IWebhookFunctions): Promise<IWebhookResponseData>;
	poll?(context: IPollFunctions): Promise<INodeExecutionData[][] | null>;
}
// end module: Node


// module: FORM_NODE_TYPE
FORM_NODE_TYPE = 'n8n-nodes-base.form'
// end module: FORM_NODE_TYPE


// module: FORM_TRIGGER_NODE_TYPE
FORM_TRIGGER_NODE_TYPE = 'n8n-nodes-base.formTrigger'
// end module: FORM_TRIGGER_NODE_TYPE


// module: tryToParseJsonToFormFields
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
// end module: tryToParseJsonToFormFields


// module: OperationalError
export class OperationalError extends BaseError {
	constructor(message: string, opts: OperationalErrorOptions = {}) {
		opts.level = opts.level ?? 'warning';

		super(message, opts);
	}
}
// end module: OperationalError


// module: MultiPartFormData NOT FOUND


// module: WAIT_NODE_TYPE
WAIT_NODE_TYPE = 'n8n-nodes-base.wait'
// end module: WAIT_NODE_TYPE


// module: FORM_TRIGGER_PATH_IDENTIFIER
FORM_TRIGGER_PATH_IDENTIFIER = 'n8n-form'
// end module: FORM_TRIGGER_PATH_IDENTIFIER


// module: ADD_FORM_NOTICE
ADD_FORM_NOTICE = 'addFormPage'
// end module: ADD_FORM_NOTICE


// module: WAIT_INDEFINITELY
WAIT_INDEFINITELY = new Date('3000-01-01T00:00:00.000Z')
// end module: WAIT_INDEFINITELY


// module: DeclarativeRestApiSettings NOT FOUND


// module: IExecutePaginationFunctions
export interface IExecutePaginationFunctions extends IExecuteSingleFunctions {
	makeRoutingRequest(
		this: IAllExecuteFunctions,
		requestOptions: DeclarativeRestApiSettings.ResultOptions,
	): Promise<INodeExecutionData[]>;
}
// end module: IExecutePaginationFunctions


// module: NodeExecutionHint
export type NodeExecutionHint = Omit<NodeHint, 'whenToDisplay' | 'displayCondition'>;
// end module: NodeExecutionHint


// module: isSafeObjectProperty
export function isSafeObjectProperty(property: string) {
	return !unsafeObjectProperties.has(property);
}
// end module: isSafeObjectProperty


// module: IRequestOptionsSimplified
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
// end module: IRequestOptionsSimplified


// module: randomString
export function randomString(minLength: number, maxLength?: number): string {
	const length = maxLength === undefined ? minLength : randomInt(minLength, maxLength + 1);
	return [...crypto.getRandomValues(new Uint32Array(length))]
		.map((byte) => ALPHABET[byte % ALPHABET.length])
		.join('');
}
// end module: randomString


// module: setSafeObjectProperty
export function setSafeObjectProperty(
	target: Record<string, unknown>,
	property: string,
	value: unknown,
) {
	if (isSafeObjectProperty(property)) {
		target[property] = value;
	}
}
// end module: setSafeObjectProperty


// module: removeCircularRefs
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
// end module: removeCircularRefs


// module: PaginationOptions
export interface PaginationOptions {
	binaryResult?: boolean;
	continue: boolean | string;
	request: IRequestOptionsSimplifiedAuth;
	requestInterval: number;
	maxRequests?: number;
}
// end module: PaginationOptions


// module: Logger
export type Logger = Record<
	Exclude<LogLevel, 'silent'>,
	(message: string, metadata?: LogMetadata) => void
>;
// end module: Logger


// module: ensureError
export function ensureError(error: unknown): Error {
	return error instanceof Error
		? error
		: new Error('Error that was not an instance of Error was thrown', {
				// We should never throw anything except something that derives from Error
				cause: error,
			});
}
// end module: ensureError


// module: ResourceMapperValue
export type ResourceMapperValue = {
	mappingMode: string;
	value: { [key: string]: string | number | boolean | null } | null;
	matchingColumns: string[];
	schema: ResourceMapperField[];
	attemptToConvertTypes: boolean;
	convertFieldsToString: boolean;
};
// end module: ResourceMapperValue


// module: SSHCredentials
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
// end module: SSHCredentials


// module: PreSendAction
export type PreSendAction = (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
) => Promise<IHttpRequestOptions>;
// end module: PreSendAction


// module: IDisplayOptions
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
// end module: IDisplayOptions


// module: randomInt
export function randomInt(min: number, max?: number): number {
	if (max === undefined) {
		max = min;
		min = 0;
	}
	return min + (crypto.getRandomValues(new Uint32Array(1))[0] % (max - min));
}
// end module: randomInt


// module: NodeParameterValueType
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
// end module: NodeParameterValueType


// module: INodePropertyCollection
export interface INodePropertyCollection {
	displayName: string;
	name: string;
	values: INodeProperties[];
}
// end module: INodePropertyCollection


// module: IExecuteResponsePromiseData
export type IExecuteResponsePromiseData = IDataObject | IN8nHttpFullResponse;
// end module: IExecuteResponsePromiseData


// module: IN8nHttpResponse
export type IN8nHttpResponse = IDataObject | Buffer | GenericValue | GenericValue[] | null;
// end module: IN8nHttpResponse


// module: WEBHOOK_NODE_TYPE
WEBHOOK_NODE_TYPE = 'n8n-nodes-base.webhook'
// end module: WEBHOOK_NODE_TYPE


// module: CHAT_TRIGGER_NODE_TYPE
CHAT_TRIGGER_NODE_TYPE = '@n8n/n8n-nodes-langchain.chatTrigger'
// end module: CHAT_TRIGGER_NODE_TYPE


// module: CronExpression
export type CronExpression =
	`${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit}`;
// end module: CronExpression


// module: getValueDescription
getValueDescription = <T>(value: T): string => {
	if (typeof value === 'object') {
		if (value === null) return "'null'";
		if (Array.isArray(value)) return 'array';
		return 'object';
	}

	return `'${String(value)}'`;
}
// end module: getValueDescription


// module: validateFieldType
export function validateFieldType(
	fieldName: string,
	value: unknown,
	type: FieldType,
	options: ValidateFieldTypeOptions = {},
): ValidationResult {
	if (value === null || value === undefined) return { valid: true };
	const strict = options.strict ?? false;
	const valueOptions = options.valueOptions ?? [];
	const parseStrings = options.parseStrings ?? false;

	const defaultErrorMessage = `'${fieldName}' expects a ${type} but we got ${getValueDescription(value)}`;
	switch (type.toLowerCase()) {
		case 'string': {
			if (!parseStrings) return { valid: true, newValue: value };
			try {
				if (strict && typeof value !== 'string') {
					return { valid: false, errorMessage: defaultErrorMessage };
				}
				return { valid: true, newValue: tryToParseString(value) };
			} catch (e) {
				return { valid: false, errorMessage: defaultErrorMessage };
			}
		}
		case 'string-alphanumeric': {
			try {
				return { valid: true, newValue: tryToParseAlphanumericString(value) };
			} catch (e) {
				return {
					valid: false,
					errorMessage:
						'Value is not a valid alphanumeric string, only letters, numbers and underscore allowed',
				};
			}
		}
		case 'number': {
			try {
				if (strict && typeof value !== 'number') {
					return { valid: false, errorMessage: defaultErrorMessage };
				}
				return { valid: true, newValue: tryToParseNumber(value) };
			} catch (e) {
				return { valid: false, errorMessage: defaultErrorMessage };
			}
		}
		case 'boolean': {
			try {
				if (strict && typeof value !== 'boolean') {
					return { valid: false, errorMessage: defaultErrorMessage };
				}
				return { valid: true, newValue: tryToParseBoolean(value) };
			} catch (e) {
				return { valid: false, errorMessage: defaultErrorMessage };
			}
		}
		case 'datetime': {
			try {
				return { valid: true, newValue: tryToParseDateTime(value) };
			} catch (e) {
				const luxonDocsURL =
					'https://moment.github.io/luxon/api-docs/index.html#datetimefromformat';
				const errorMessage = `${defaultErrorMessage} <br/><br/> Consider using <a href="${luxonDocsURL}" target="_blank"><code>DateTime.fromFormat</code></a> to work with custom date formats.`;
				return { valid: false, errorMessage };
			}
		}
		case 'time': {
			try {
				return { valid: true, newValue: tryToParseTime(value) };
			} catch (e) {
				return {
					valid: false,
					errorMessage: `'${fieldName}' expects time (hh:mm:(:ss)) but we got ${getValueDescription(value)}.`,
				};
			}
		}
		case 'object': {
			try {
				if (strict && !isObject(value)) {
					return { valid: false, errorMessage: defaultErrorMessage };
				}
				return { valid: true, newValue: tryToParseObject(value) };
			} catch (e) {
				return { valid: false, errorMessage: defaultErrorMessage };
			}
		}
		case 'array': {
			if (strict && !Array.isArray(value)) {
				return { valid: false, errorMessage: defaultErrorMessage };
			}
			try {
				return { valid: true, newValue: tryToParseArray(value) };
			} catch (e) {
				return { valid: false, errorMessage: defaultErrorMessage };
			}
		}
		case 'options': {
			const validOptions = valueOptions.map((option) => option.value).join(', ');
			const isValidOption = valueOptions.some((option) => option.value === value);

			if (!isValidOption) {
				return {
					valid: false,
					errorMessage: `'${fieldName}' expects one of the following values: [${validOptions}] but we got ${getValueDescription(
						value,
					)}`,
				};
			}
			return { valid: true, newValue: value };
		}
		case 'url': {
			try {
				return { valid: true, newValue: tryToParseUrl(value) };
			} catch (e) {
				return { valid: false, errorMessage: defaultErrorMessage };
			}
		}
		case 'jwt': {
			try {
				return { valid: true, newValue: tryToParseJwt(value) };
			} catch (e) {
				return {
					valid: false,
					errorMessage: 'Value is not a valid JWT token',
				};
			}
		}
		case 'form-fields': {
			try {
				return { valid: true, newValue: tryToParseJsonToFormFields(value) };
			} catch (e) {
				return {
					valid: false,
					errorMessage: (e as Error).message,
				};
			}
		}
		default: {
			return { valid: true, newValue: value };
		}
	}
}
// end module: validateFieldType


// module: tryToParseDateTime
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
// end module: tryToParseDateTime


// module: DeduplicationScope
export type DeduplicationScope = 'node' | 'workflow';
// end module: DeduplicationScope


// module: IWebhookDescription
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
// end module: IWebhookDescription
