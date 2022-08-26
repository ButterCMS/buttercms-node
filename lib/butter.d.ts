import { AxiosInstance } from "axios";

////////////////////////////
// Internal utility types //
////////////////////////////

type FlatValue<Type, Key> = Key extends `${infer I}.${infer J}`
  ? I extends keyof Type
    ? FlatValue<NonNullable<Type[I]>, J>
    : never
  : Key extends keyof Type
  ? Type[Key]
  : never;

type FlatKeys<Type, P extends string = ""> = Type extends object
  ? {
      [Key in keyof Type]: FlatKeys<
        Type[Key],
        `${P}${P extends "" ? "" : "."}${Key & string}`
      >;
    }[keyof Type]
  : P;

// Use to flatten types and prefix with "fields." so they can be filtered
type WithFieldsPrefix<Type extends object> = {
  [Key in FlatKeys<Type> as Key extends string
    ? `fields.${Key}`
    : never]?: FlatValue<NonNullable<Type>, Key>;
};

// Creates a type where the ContentModel keys are also prefixed with "-" for a decreasing order
type OrderParam<ContentModel extends object> = {
  [Key in keyof ContentModel as Key extends string
    ? `${"-" | ""}${Key}`
    : never]: ContentModel[Key];
};

type ContentArrays<ContentModels extends object> = {
  [Key in keyof ContentModels as Key extends string ? Key : never]: Array<
    ContentModels[Key]
  >;
};

type ContentModelTopLevelValues<T extends object = object> =
  T[keyof T] extends object ? T[keyof T] : never;

type FlattenContentModels<U extends object> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I extends object) => void
  ? I
  : never;

export namespace Butter {
  ///////////////////
  // Utility types //
  ///////////////////

  interface Meta {
    next_page: number | null;
    previous_page: number | null;
    count: number;
  }

  interface Response<Data extends object> {
    data?: Data;
    status?: number;
    statusText?: string;
    headers?: Record<string, any>;
    config?: Record<string, any>;
  }

  //////////
  // Post //
  //////////

  interface PostRetrieveParams {
    preview?: 1 | 0;
  }

  interface PostListParams<AuthorSlug extends string = string> {
    preview?: 1 | 0;
    /**
     * If true, it will only get the article's details and not the article content
     */
    exclude_body?: boolean;
    page?: number;
    page_size?: number;
    author_slug?: AuthorSlug;
    category_slug?: string;
    tag_slug?: string;
  }

  interface PostSearchParams {
    page?: number;
    page_size?: number;
  }

  interface Post<
    AuthorSlug extends string = string,
    PostSlug extends string = string
  > {
    status: "published" | "draft";
    created: Date;
    updated: Date;
    published: Date;
    title: string;
    slug: PostSlug;
    summary: string;
    seo_title: string;
    meta_description: string;
    featured_image: string;
    featured_image_alt: string;
    url: string;
    author: Omit<Author<AuthorSlug>, "recent_posts">;
    tags: Tag[];
    categories: Category[];
    body?: string;
  }

  interface PostRetrieveResponse<
    AuthorSlug extends string = string,
    PostSlug extends string = string
  > {
    data: Post<AuthorSlug, PostSlug>;
  }

  interface PostListResponse<
    AuthorSlug extends string = string,
    PostSlug extends string = string
  > {
    meta: Meta;
    data: Post<AuthorSlug, PostSlug>[];
  }

  interface PostSearchResponse {
    meta: Meta;
    data: Post[];
  }

  interface PostMethods {
    retrieve<PostSlug extends string = string>(
      slug: PostSlug,
      params?: PostRetrieveParams
    ): Promise<Response<PostRetrieveResponse<string, PostSlug>>>;

    list<AuthorSlug extends string = string>(
      params?: PostListParams<AuthorSlug>
    ): Promise<Response<PostListResponse<AuthorSlug>>>;

    search(
      query: string,
      params?: PostSearchParams
    ): Promise<Response<PostSearchResponse>>;
  }

  //////////////
  // Category //
  //////////////

  interface CategoryParams {
    /**
     * If undefined, it will only get the details on the category and not any articles relating to it
     */
    include?: "recent_posts";
  }

  interface Category<CategorySlug extends string = string> {
    name: string;
    slug: CategorySlug;
    recent_posts?: Post[];
  }

  interface CategoryRetrieveResponse<CategorySlug extends string = string> {
    data: Category<CategorySlug>;
  }

  interface CategoryListResponse {
    data: Category[];
  }

  interface CategoryMethods {
    retrieve<CategorySlug extends string = string>(
      slug: CategorySlug,
      params?: CategoryParams
    ): Promise<Response<CategoryRetrieveResponse<CategorySlug>>>;

    list(params?: CategoryParams): Promise<Response<CategoryListResponse>>;
  }

  /////////
  // Tag //
  /////////

  interface TagParams {
    /**
     * Get 10 most recent articles of this tag
     */
    include?: "recent_posts";
  }

  interface Tag<TagSlug extends string = string> {
    name: string;
    slug: TagSlug;
    recent_posts?: Post[];
  }

  interface TagRetrieveResponse<TagSlug extends string = string> {
    data: Tag<TagSlug>;
  }

  interface TagListResponse {
    data: Tag[];
  }

  interface TagMethods {
    retrieve<TagSlug extends string = string>(
      slug: TagSlug,
      params?: TagParams
    ): Promise<Response<TagRetrieveResponse<TagSlug>>>;

    list(params?: TagParams): Promise<Response<TagListResponse>>;
  }

  ////////////
  // Author //
  ////////////

  interface AuthorParams {
    /**
     * Get 10 most recent articles by the author
     */
    include?: "recent_posts";
  }

  interface Author<AuthorSlug extends string = string> {
    first_name: string;
    last_name: string;
    email: string;
    slug: AuthorSlug;
    bio: string;
    title: string;
    linkedin_url: `https://www.linkedin.com/in/${string}`;
    facebook_url: `https://www.facebook.com/${string}`;
    pinterest_url: `https://www.pinterest.com/${string}`;
    instagram_url: `https://www.instagram.com/${string}`;
    twitter_handle: string;
    profile_image: `https://cdn.buttercms.com/${string}`;
    recent_posts?: Post[];
  }

  interface AuthorRetrieveResponse<AuthorSlug extends string = string> {
    data: Author<AuthorSlug>;
  }

  interface AuthorListResponse {
    data: Author[];
  }

  interface AuthorMethods {
    retrieve<AuthorSlug extends string = string>(
      slug: string,
      params?: AuthorParams
    ): Promise<Response<AuthorRetrieveResponse<AuthorSlug>>>;

    list(params?: AuthorParams): Promise<Response<AuthorListResponse>>;
  }

  interface FeedMethods {
    retrieve(slug: string, params?: any): Promise<Response<object>>;
  }

  //////////
  // Page //
  //////////

  interface PageRetrieveParams {
    preview?: 0 | 1;
    levels?: number;
  }

  type PageListParams<PageModel extends object = object> =
    WithFieldsPrefix<PageModel> & {
      preview?: 0 | 1;
      levels?: number;
      order?: `${"-" | ""}${"published" | "updated"}`;
      page?: number;
      page_size?: number;
    };

  interface PageSearchParams<PageType extends string = string> {
    page_type?: PageType;
    locale?: string;
    levels?: number;
    page?: number;
    page_size?: number;
  }

  interface Page<
    PageModel extends object = object,
    PageType extends string = string,
    PageSlug extends string = string
  > {
    page_type: PageType;
    slug: PageSlug;
    name: string;
    published: Date;
    updated: Date;
    fields: PageModel;
  }

  interface PageRetrieveResponse<
    PageModel extends object = object,
    PageType extends string = string,
    PageSlug extends string = string
  > {
    data: Page<PageModel, PageType, PageSlug>;
  }

  interface PageListResponse<
    PageModel extends object = object,
    PageType extends string = string
  > {
    meta: Meta;
    data: Page<PageModel, PageType>[];
  }

  interface PageSearchResponse<
    PageModel extends object = object,
    PageType extends string = string
  > {
    meta: Meta;
    data: Page<PageModel, PageType>[];
  }

  interface PageMethods {
    retrieve<
      PageModel extends object = object,
      PageType extends string = string,
      PageSlug extends string = string
    >(
      page_type: PageType,
      page_slug: PageSlug,
      params?: PageRetrieveParams
    ): Promise<Response<PageRetrieveResponse<PageModel, PageType, PageSlug>>>;

    list<PageModel extends object = object, PageType extends string = string>(
      page_type: PageType,
      params?: PageListParams
    ): Promise<Response<PageListResponse<PageModel, PageType>>>;

    search<PageModel extends object = object, PageType extends string = string>(
      query: string,
      params?: PageSearchParams<PageType>
    ): Promise<Response<PageSearchResponse<PageModel, PageType>>>;
  }

  /////////////
  // Content //
  /////////////

  type ContentParams<ContentModel extends object = object> =
    WithFieldsPrefix<ContentModel> & {
      test?: 0 | 1;
      /**
       * Order collection by a specific property.
       * _Prefix with "-" for decreasing order._
       */
      order?: keyof OrderParam<ContentModel>;
      page?: number;
      page_size?: number;
      levels?: number;
    };

  interface ContentResponse<ContentModels extends object = object> {
    data: ContentModels;
  }

  interface ContentMethods {
    retrieve<ContentModels extends object = object>(
      keys: Array<keyof ContentModels>,
      params?: ContentParams<
        FlattenContentModels<ContentModelTopLevelValues<ContentModels>>
      >
    ): Promise<Response<ContentResponse<ContentArrays<ContentModels>>>>;
  }
}

export class ButterStatic {
  post: Butter.PostMethods;
  category: Butter.CategoryMethods;
  tag: Butter.TagMethods;
  author: Butter.AuthorMethods;
  feed: Butter.FeedMethods;
  page: Butter.PageMethods;
  content: Butter.ContentMethods;
  constructor(
    apiToken: string,
    testMode?: boolean,
    timeout?: number,
    axiosHook?: (axios: AxiosInstance) => unknown
  );
}

export const Butter: (
  apiToken: string,
  testMode?: boolean,
  timeout?: number,
  axiosHook?: (axios: AxiosInstance) => unknown
) => ButterStatic;

export default Butter;
