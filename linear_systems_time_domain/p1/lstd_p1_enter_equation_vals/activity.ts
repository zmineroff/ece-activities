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

        $("#diffeq_var_1").val(data.state.diffeq_var_1);
        $("#coeff_linear_term").val(data.state.coeff_linear_term);
        $("#diffeq_var_2").val(data.state.diffeq_var_2);
        $("#forcing_function").val(data.state.forcing_function);

        $("#hint").empty().append(widgets.hint(data.hints!, data.state.hint));
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
    },
    parse: (state: State): [ParseResponse] => {
        if (state.diffeq_var_1.trim() === "") return [null];
        const n = parseInt(state.diffeq_var_1);
        if (isNaN(n)) return ["nan"];
        if (n < 42) return ["small"];
        if (n > 42) return ["big"];
        return ["justright"];
    }
};

export default activity;
