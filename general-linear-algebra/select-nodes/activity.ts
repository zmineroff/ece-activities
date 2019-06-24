import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";

interface State {
    answer: string;
    hint: widgets.HintData;
}

const activity: Activity<State> = {
    init: (): State => ({ answer: "", hint: widgets.emptyHint }),
    read: (): State => ({
        answer: `${$("#answer").val()}`,
        hint: widgets.readHint($("#hint"))
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);
        $("#answer").val(data.state.answer);
        $("#hint").empty().append(widgets.hint(data.hints!, data.state.hint));
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
        $("#circuit-image").attr("src", data.config.circuitImg);
    },
    parse: (state: State): [ParseResponse] => {
        if (state.answer.trim() === "") return [null];
        const n = parseInt(state.answer);
        if (isNaN(n)) return ["nan"];
        if (n < 42) return ["small"];
        if (n > 42) return ["big"];
        return ["justright"];
    }
};

export default activity;
