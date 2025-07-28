export interface PostBodyI {
    content : string,
    mediaIds? : string[],
}

export type PostUpdateBodyI  = Partial<PostBodyI>;