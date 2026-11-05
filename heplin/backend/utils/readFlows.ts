import fs from "fs"
import path from "path"
import array from "./array";
let flowsObj: any = null;

const flows = () => {
    if (!flowsObj) {
        const flowsContent = fs.readFileSync(path.join(__dirname, "../flow-config.json"), "utf-8");
        flowsObj = JSON.parse(flowsContent).reduce((acc: any, flow: any) => {
            return [...acc, ...array(flow?.endpoints)]
        }, [])
    }
    return flowsObj;
}

export default flows()