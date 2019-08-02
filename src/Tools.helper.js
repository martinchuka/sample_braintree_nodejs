
export class ToolsHelper{
    constructor(){
    }


    static isMissing(requestBody,requiredParam){
        for(let i in requiredParam){
            if(!requestBody[requiredParam[i]] && requestBody[requiredParam[i]]!==0 && requestBody[requiredParam[i]]!==false){
                return requiredParam[i];
            }
        }
    }


    static canContain(requestBody,canContain){
        let updateObject={};
        for(let i in canContain){
            if((requestBody[canContain[i]] || requestBody[canContain[i]]===0 || requestBody[canContain[i]]===false) && requestBody[canContain[i]]!==null){
                updateObject[canContain[i]]=requestBody[canContain[i]];
            }
        }
        return updateObject;
    }
}