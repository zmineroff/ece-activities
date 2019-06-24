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
    answer: math.matrix(readMatrixInterface(nLeftRows, nLeftCols)),
    hint: widgets.readHint($("#hint"))
  }),
  render: (data: QuestionData<State>): void => {
    $("#prompt").html(data.prompt!);
    for (let iRow = 0; iRow < nLeftRows; iRow++) {
      for (let iCol = 0; iCol < nLeftCols; iCol++) {
        let inputId = "#answer_" + iRow + "_" + iCol;
        $(inputId).val(data.state.answer.get([iRow, iCol]));
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
    for (let iRow = 0; iRow < nLeftRows; iRow++) {
      for (let iCol = 0; iCol < nLeftCols; iCol++) {
        let value = state.answer.get([iRow, iCol]);
        if (value === null) {
          return ["nan"];
        }
      }
    }

    const correctM = math.matrix([[23/24,  -1/2,     0,  -1/8],
                                  [  1/2,  -3/4,   1/4,     0],
                                  [    0,   1/4,  -3/4,   1/2],
                                  [  1/8,     0,   1/2,  -9/8]]);

    const floatCompTolerance = 0.001;
    for (let iRow = 0; iRow < nLeftRows; iRow++) {
      let firstColResp = state.answer.get([iRow, 0]);
      let scalar = firstColResp / correctM.get([iRow,0]);
      for (let iCol = 1; iCol < nLeftCols; iCol++) {
        let correctByScalar = correctM.get([iRow,iCol]) * scalar;
        let value = state.answer.get([iRow, iCol]);
        let valueCorrect = Math.abs(correctByScalar - value) < floatCompTolerance;

        if (!valueCorrect) {
          console.log("firstColResp: " + firstColResp);
          console.log("scalar: " + scalar);
          console.log("correctByScalar: " + correctByScalar);
          console.log("value: " + value);
          console.log(iCol);
          return ["row"+iRow+"wrong"];
        }
      }
    }

    return ["correct"];
  }
};

export default activity;



// TODO: handle fractions (if so, don't use number type on input)
// 2nd answer https://stackoverflow.com/questions/7142657/convert-fraction-string-to-decimal
function readMatrixInterface(nRows: number, nCols: number) {
  var m = math.matrix();
  m.resize([nRows, nCols], undefined);

  for (let iRow = 0; iRow < nRows; iRow++) {
    for (let iCol = 0; iCol < nCols; iCol++) {
      let inputId = "#answer_" + iRow + "_" + iCol;
      let value = parseFloat(`${$(inputId).val()}`);
      if (isNaN(value)) {
        value = null;
      }

      m.subset(math.index(iRow, iCol), value);
    }
  }

  return m;
}
