import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";

interface State {
    x_expression: string;
    h_expression: string;
}

const activity: Activity<State> = {
    init: (): State => ({
        x_expression: "",
        h_expression: ""
    }),
    read: (): State => ({
        x_expression: `${$("#x_expression").val()}`,
        h_expression: `${$("#h_expression").val()}`
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);

        // Need to use .attr('value', value) instead of .val(value) for mathml inputs
        $("#x_expression").attr('value', data.state.x_expression);
        $("#h_expression").attr('value', data.state.h_expression);

        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
    },
    parse: (state: State): [ParseResponse] => {
        let x_resp = state.x_expression.replace(/\s/g,'');
        let h_resp = state.h_expression.replace(/\s/g,'');

        if (x_resp === "" || h_resp === "") {
                return ["nan"];
        }

        if (x_resp.toUpperCase() !== "K") {
            return ["x_resp_wrong"];
        }

        if (h_resp.toUpperCase() !== "N-K") {
            return ["h_resp_wrong"];
        }

        return ["correct"];
    }
};

export default activity;
