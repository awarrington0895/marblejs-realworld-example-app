export interface CreateArticle {
  readonly article: {
    readonly title: string;
    readonly description: string;
    readonly body: string;
    readonly favorited: boolean;
    readonly tagList: string[];
  };
}
