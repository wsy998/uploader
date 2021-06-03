export type HES=HTMLElement|string
export interface UploaderConfig {
    //
    pick?:HES;
    //
    drop?:HES;
    //
    container:HES;
    //
    multiple?:boolean
    // 是否分片
    chunked?: boolean
    // 分片大小
    chunkSize?: number
    // 线程数
    thread?: number
    // 测试URL
    testURL?: string
    // 上传URL
    uploadURL?: string
    // 文件数量限制
    fileNumLimit?: number
    // 文件大小限制
    fileSizeLimit?: number
    // 单个文件大小
    fileSingleSizeLimit?: number
    // 文件变量
    fileVal?: string
    // 附带数据
    data?: any
    // 重试
    chunkRetry?:number,
    //后缀名
    ext?:string
    // 检查MIME
    checkMIME?:boolean
    // 自定义MIME
    CustomMIME?:Record<string, Array<string>>
}