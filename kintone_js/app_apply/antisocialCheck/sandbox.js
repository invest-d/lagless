import { CLIENT } from "../../util/kintoneAPI";
import { getCompanyAppSchema } from "../../util/environments";
// import { schema_28 } from "../../28/schema";
const schema_28 = getCompanyAppSchema(kintone.app.getId());
if (!schema_28) throw new Error();
import { schema_79 } from "../../79/schema";
import { addToukiRecord, buildToukiRecord } from "./fetchTouki";

(function () {
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.detail.show", (event) => {
        kintone.app.record.getHeaderMenuSpaceElement().appendChild(createButton());
    });
})();

const buttonId = "sandbox";
const buttonTitle = "サンドボックス";
const createButton = () => {
    const button = document.createElement("button");
    button.id = buttonId;
    button.innerText = buttonTitle;
    button.addEventListener("click", clickButton);
    return button;
};

const clickButton = async () => {
    const company = await CLIENT.record.getRecord({
        app: schema_28.id.appId,
        id: "6189"
    });
    const exam = await CLIENT.record.getRecord({
        app: schema_79.id.appId,
        id: "4065"
    });
    const toukiRecord = buildToukiRecord(company.record, exam.record);
    console.log(toukiRecord);
    const newId = await addToukiRecord(toukiRecord);
    console.log(newId);
};
