declare module "mammoth/mammoth.browser" {
  export interface ConvertToHtmlResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface ConvertToMarkdownResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface Options {
    arrayBuffer?: ArrayBuffer;
    path?: string;
    buffer?: Buffer;
  }

  export function convertToHtml(options: Options): Promise<ConvertToHtmlResult>;
  export function convertToMarkdown(options: Options): Promise<ConvertToMarkdownResult>;
  export function extractRawText(options: Options): Promise<ConvertToHtmlResult>;

  const mammoth: {
    convertToHtml: (options: Options) => Promise<ConvertToHtmlResult>;
    convertToMarkdown: (options: Options) => Promise<ConvertToMarkdownResult>;
    extractRawText: (options: Options) => Promise<ConvertToHtmlResult>;
  };

  export default mammoth;
}
