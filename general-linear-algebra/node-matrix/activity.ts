import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";
import * as math from 'mathjs';

const nLeftRows = 4;
const nLeftCols = 4;

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
        answer: math.matrix(readMatrixInterface(nLeftRows,nLeftCols)),
        hint: widgets.readHint($("#hint"))
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);
        $("#answer_0_0").val(data.state.answer.get([0,0]));
        $("#hint")
            .empty()
            .append(widgets.hint(data.hints!, data.state.hint));
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
    },
    parse: (state: State): [ParseResponse] => {
        if (state.answer.get([0,0]) === undefined) return ["nan"];
        const n = parseFloat(state.answer.get([0,0]));
        if (isNaN(n)) return ["nan"];
        if (n < 42) return ["small"];
        if (n > 42) return ["big"];
        return ["justright"];
    }
};

export default activity;



function readMatrixInterface(nRows, nCols) {
  var m = math.matrix();
  m.resize([nRows, nCols], undefined);

  for (let iRow=0; iRow<nRows; iRow++) {
    for (let iCol=0; iCol<nCols; iCol++) {
      let inputId = "#answer_" + iRow + "_" + iCol;
      let value = parseFloat(`${$(inputId).val()}`);

      console.log(inputId);
      console.log(value);
      if (isNaN(value)) {
        console.log('hoi');
        value = undefined;
      }

      m.subset(math.index(iRow, iCol),value);
    }
  }

  return m;
}
