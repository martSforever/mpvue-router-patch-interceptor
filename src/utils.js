export function pushArray(targetArray, dataArray) {
    if (!dataArray) return
    if (!dataArray instanceof Array) {
        console.error('dataArray的参数必须是一个数组');
        return;
    }
    dataArray.forEach((item) => {
        targetArray.push(item);
    })
}