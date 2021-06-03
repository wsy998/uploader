
class LimitedArray<T> extends Array<T> {
    private readonly _limited: number;

    constructor(limited: number,arr?:Array<T>) {
        super(limited);
        if(typeof arr!=='undefined'){
            arr.forEach(v=>{
                this.push(v);
            })
        }

        this._limited = limited

    }

    isPush(): boolean {
        return this._limited > this.length;
    }

    push(...items:T[]): number {
        items.forEach((item:T)=>{
            if(this.isPush()) {
                super.push(item);
            }
        });
        return  this.length;
    }


}