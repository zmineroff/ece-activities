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
      answer: math.matrix().resize([nLeftRows, nLeftCols], null),
      hint: widgets.emptyHint
    }),
    read: (): State => ({
        answer: math.matrix(readMatrixInterface(nLeftRows,nLeftCols)),
        hint: widgets.readHint($("#hint"))
    }),
    render: (data: QuestionData<State>): void => {
        $("#prompt").html(data.prompt!);
        for (let iRow=0; iRow<nLeftRows; iRow++) {
          for (let iCol=0; iCol<nLeftCols; iCol++) {
            let inputId = "#answer_" + iRow + "_" + iCol;
            $(inputId).val(data.state.answer.get([iRow,iCol]));
          }
        }
        $("#hint")
            .empty()
            .append(widgets.hint(data.hints!, data.state.hint));
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
    },
    parse: (state: State): [ParseResponse] => {
        if (state.answer.get([0,0]) === null) return ["nan"];
        const n = parseFloat(state.answer.get([0,0]));
        const n2 = parseFloat(state.answer.get([0,1]));
        if (isNaN(n)) return ["nan"];

        if (n==n2) {
          return ["justright"];
        }

        if (n < 42) return ["small"];
        if (n > 42) return ["big"];
        return ["justright"];
    }
};

export default activity;



// TODO: handle fractions; 2nd answer https://stackoverflow.com/questions/7142657/convert-fraction-string-to-decimal
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
        value = null;
      }

      m.subset(math.index(iRow, iCol),value);
    }
  }

  return m;
}
