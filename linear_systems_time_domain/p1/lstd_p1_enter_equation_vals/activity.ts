import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";

interface State {
    diffeq_var_1: string;
    coeff_linear_term: string;
    diffeq_var_2: string;
    forcing_function: string;
    hint: widgets.HintData;
}

const activity: Activity<State> = {
    init: (): State => ({ 
        diffeq_var_1: "",
        coeff_linear_term: "",
        diffeq_var_2: "",
        forcing_function: "",
        hint: widgets.emptyHint
    }),
    read: (): State => ({
        diffeq_var_1: `${$("#diffeq_var_1").val()}`,
        coeff_linear_term: `${$("#coeff_linear_term").val()}`,
        diffeq_var_2: `${$("#diffeq_var_2").val()}`,
        forcing_function: `${$("#forcing_function").val()}`,
        hint: widgets.readHint($("#hint"))
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);

        // Need to use .attr('value', value) instead of .val(value) for mathml inputs
        $("#diffeq_var_1").attr('value', data.state.diffeq_var_1);
        $("#coeff_linear_term").attr('value', data.state.coeff_linear_term);
        $("#diffeq_var_2").attr('value', data.state.diffeq_var_2);
        $("#forcing_function").attr('value', data.state.forcing_function);

        $("#hint").empty().append(widgets.hint(data.hints!, data.state.hint));
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
    },
    parse: (state: State): [ParseResponse] => {
        let diffeq_var_1_resp = state.diffeq_var_1.replace(/\s/g,'');
        let coeff_linear_term_resp = state.coeff_linear_term.replace(/\s/g,'');
        let diffeq_var_2_resp = state.diffeq_var_2.replace(/\s/g,'');
        let forcing_function_resp = state.forcing_function.replace(/\s/g,'');

        if (diffeq_var_1_resp === ""
            || coeff_linear_term_resp === ""
            || diffeq_var_2_resp === ""
            || forcing_function_resp === "") {
                return ["nan"];
        }

        if (diffeq_var_1_resp.toUpperCase() !== "V1") {
            return ["diffeq_var_1_wrong"];
        }
        if (coeff_linear_term_resp.toUpperCase() !== "1/RC") {
            return ["coeff_linear_term_wrong"];
        }
        if (diffeq_var_2_resp.toUpperCase() !== "V1") {
            return ["diffeq_var_2_wrong"];
        }
        if (forcing_function_resp.toUpperCase() !== "IS/C") {
            return ["forcing_function_wrong"];
        }

        return ["correct"];
    }
};

export default activity;
