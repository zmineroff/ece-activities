import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";

interface State {
    answer: string;
}

const activity: Activity<State> = {
    init: (): State => ({ answer: "" }),
    read: (): State => ({
        answer: `${$("#answer").val()}`
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);
        $("#answer").val(data.state.answer);
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
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
