export interface CreateArticle {
  readonly title: string;
  readonly description: string;
  readonly body: string;
  readonly favorited: boolean;
}