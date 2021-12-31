import { FastTextModel, loadFastTextModel } from "@pipeline/process/FastText";

// prettier-ignore
export const Languages = ["af","als","am","an","ar","arz","as","ast","av","az","azb","ba","bar","bcl","be","bg","bh","bn","bo","bpy","br","bs","bxr","ca","cbk","ce","ceb","ckb","co","cs","cv","cy","da","de","diq","dsb","dty","dv","el","eml","en","eo","es","et","eu","fa","fi","fr","frr","fy","ga","gd","gl","gn","gom","gu","gv","he","hi","hif","hr","hsb","ht","hu","hy","ia","id","ie","ilo","io","is","it","ja","jbo","jv","ka","kk","km","kn","ko","krc","ku","kv","kw","ky","la","lb","lez","li","lmo","lo","lrc","lt","lv","mai","mg","mhr","min","mk","ml","mn","mr","mrj","ms","mt","mwl","my","myv","mzn","nah","nap","nds","ne","new","nl","nn","no","oc","or","os","pa","pam","pfl","pl","pms","pnb","ps","pt","qu","rm","ro","ru","rue","sa","sah","sc","scn","sco","sd","sh","si","sk","sl","so","sq","sr","su","sv","sw","ta","te","tg","th","tk","tl","tr","tt","tyv","ug","uk","ur","uz","vec","vep","vi","vls","vo","wa","war","wuu","xal","xmf","yi","yo","yue","zh"];

const LABEL_PREFIX_LENGTH = "__label__".length;

export class LanguageDetector {
    private model: FastTextModel | undefined;

    public async init() {
        if (this.model === undefined) {
            this.model = await loadFastTextModel("lid.176");
        }
    }

    public detect(text: string): number | -1 {
        if (this.model === undefined) throw new Error("Language Model not initialized");

        const result = this.model.predict(text, 1, 0.0);
        if (result.length >= 1) return Languages.indexOf(result[0][1].slice(LABEL_PREFIX_LENGTH));
        return -1;
    }
}
