import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";
import { read } from "fs";

interface State {
    x_expression: string;
    h_expression: string;
    incorFdbkGiven: string;
}

const activity: Activity<State> = {
    init: (): State => ({
        x_expression: "",
        h_expression: "",
        incorFdbkGiven: "false"
    }),
    read: (): State => ({
        x_expression: `${$("#x_expression").val()}`,
        h_expression: `${$("#h_expression").val()}`,
        incorFdbkGiven: `${$("#incorFdbkGiven").val()}`
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);

        // Need to include .attr('value', value) for mathml inputs
        $("#x_expression").val(data.state.x_expression);
        $("#x_expression").attr('value', data.state.x_expression);

        $("#h_expression").val(data.state.h_expression);
        $("#h_expression").attr('value', data.state.h_expression);

        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));


        $("#incorFdbkGiven").val("false");
        if (   data.parts[0].feedback
            && data.parts[0].feedback.status === "incorrect"
            && data.parts[0].feedback.key !== "nan") {
            $("#incorFdbkGiven").val("true");
        }
    },
    parse: (state: State): [ParseResponse] => {
        let x_resp = state.x_expression.replace(/\s/g,'');
        let h_resp = state.h_expression.replace(/\s/g,'');

        if (x_resp === "" || h_resp === "") {
            return ["nan"];
        }

        let incorFdbkGiven = state.incorFdbkGiven === "true";

        let x_resp_wrong = x_resp.toUpperCase() !== "K";
        let h_resp_wrong = h_resp.toUpperCase() !== "N-K";

        if (incorFdbkGiven) {
            if (x_resp_wrong || h_resp_wrong) {
                return ["bottom_out"];
            }
        }

        if (x_resp_wrong) {
            return ["x_resp_wrong"];
        }

        if (h_resp_wrong) {
            return ["h_resp_wrong"];
        }

        return ["correct"];
    }
};

export default activity;
