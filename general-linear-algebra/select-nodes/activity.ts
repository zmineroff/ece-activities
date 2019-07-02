import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";

interface State {
    answer: string[];
    hint: widgets.HintData;
}

const activity: Activity<State> = {
    init: (): State => ({ answer: [], hint: widgets.emptyHint }),
    read: (): State => ({
        answer: readAnswerFromInterface(),
        hint: widgets.readHint($("#hint"))
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);
        $("input:checkbox[name=answer]").each(function(){
            let inputValue = `${$(this).val()}`;
            if (data.state.answer.includes(inputValue)) {
                $(this).prop("checked", true);
            } else {
                $(this).prop("checked", false);
            }
        });
        $("#hint").empty().append(widgets.hint(data.hints!, data.state.hint));
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
        $("#circuit-image").attr("src", data.config.circuitImg);
    },
    parse: (state: State): [ParseResponse] => {
        if (state.answer === []) return [null];

        let selectedVoltageNode = state.answer.includes("A") || state.answer.includes("E");
        if (selectedVoltageNode) {
            return ["selectedVoltageNode"];
        }

        let selectedIrrelevantNode = state.answer.includes("D") || state.answer.includes("H");
        if (selectedIrrelevantNode) {
            return ["selectedIrrelevantNode"]
        }

        let allCorrectSelected = state.answer.includes("B")
                                 && state.answer.includes("C")
                                 && state.answer.includes("F")
                                 && state.answer.includes("G");

        if (allCorrectSelected) {
            return ["correct"];
        } else {
            return["selectedSubsetCorrect"];
        }
    }
};

export default activity;


function readAnswerFromInterface() {
    let answerArray = []
    $("input:checkbox[name=answer]:checked").each(function(){
        answerArray.push($(this).val());
    });

    return answerArray;
}