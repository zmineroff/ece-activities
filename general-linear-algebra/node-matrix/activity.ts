import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";
import * as math from 'mathjs';

interface State {
    answer: math.Matrix;
    hint: widgets.HintData;
}

const activity: Activity<State> = {
    init: (): State => ({
      answer: math.matrix([[undefined, undefined, undefined, undefined],
                           [undefined, undefined, undefined, undefined],
                           [undefined, undefined, undefined, undefined],
                           [undefined, undefined, undefined, undefined]]),
      hint: widgets.emptyHint
    }),
    read: (): State => ({
        answer: math.matrix(readMatrixValues()),
        hint: widgets.readHint($("#hint"))
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);
        $("#answer_1_1").val(data.state.answer.get([0,0]));
        $("#hint")
            .empty()
            .append(widgets.hint(data.hints!, data.state.hint));
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
    },
    parse: (state: State): [ParseResponse] => {
        if (state.answer.get([0,0]) === undefined) return [null];
        const n = parseFloat(state.answer.get([0,0]));
        if (isNaN(n)) return ["nan"];
        if (n < 42) return ["small"];
        if (n > 42) return ["big"];
        return ["justright"];
    }
};

export default activity;


function readMatrixValue(inputID) {
  return parseFloat(`${$(inputID).val()}`);
}

function readMatrixValues() {
  const m = math.matrix([[readMatrixValue("#answer_1_1"),undefined,undefined,undefined],
               [undefined, undefined, undefined, undefined],
               [undefined, undefined, undefined, undefined],
               [undefined, undefined, undefined, undefined]])

  return m;
}