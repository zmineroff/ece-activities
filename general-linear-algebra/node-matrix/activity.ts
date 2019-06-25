import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";
import * as math from 'mathjs';

const nRows = 4;
const nCols = 5;

interface State {
  answer: math.Matrix;
  hint: widgets.HintData;
}

const activity: Activity<State> = {
  init: (): State => ({
    answer: math.matrix().resize([nRows, nCols], null),
    hint: widgets.emptyHint
  }),
  read: (): State => ({
    answer: math.matrix(readMatrixInterface(nRows, nCols)),
    hint: widgets.readHint($("#hint"))
  }),
  render: (data: QuestionData<State>): void => {
    // Prompt
    $("#prompt").html(data.prompt!);

    // Matrix inputs
    for (let iRow = 0; iRow < nRows; iRow++) {
      for (let iCol = 0; iCol < nCols; iCol++) {
        let inputId = "#answer_" + iRow + "_" + iCol;
        $(inputId).val(data.state.answer.get([iRow, iCol]));
      }
    }

    // Hints
    $("#hint")
      .empty()
      .append(widgets.hint(data.hints!, data.state.hint));

    // Feedback
    $("#feedback")
      .empty()
      .append(widgets.feedback(data.parts[0].feedback));
  },
  parse: (state: State): [ParseResponse] => {
    // Check that a number is entered in all cells
    for (let iRow = 0; iRow < nRows; iRow++) {
      for (let iCol = 0; iCol < nCols; iCol++) {
        let value = state.answer.get([iRow, iCol]);
        if (value === null) {
          return ["nan"];
        }
      }
    }

    // Check that each row of answer is a scalar multiple of correct matrix
    const correctMatrix = math.matrix([[23/24,  -1/2,     0,  -1/8,  3],
                                       [  1/2,  -3/4,   1/4,     0,  0],
                                       [    0,   1/4,  -3/4,   1/2,  0],
                                       [  1/8,     0,   1/2,  -9/8,  0]]);

    for (let iRow = 0; iRow < nRows; iRow++) {
      let submittedVector = getRowAsVector(state.answer, iRow);
      let correctVector = getRowAsVector(correctMatrix, iRow);
      let rowCorrect = isScalarMultiple(submittedVector, correctVector);
      if (!rowCorrect) {
        return ["row"+iRow+"wrong"];
      }
    }

    return ["correct"];
  }
};

export default activity;



// TODO: handle fractions (if so, don't use number type on input)
// 2nd answer https://stackoverflow.com/questions/7142657/convert-fraction-string-to-decimal
// can also use math.fraction
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

// Returns true if vector2 is a scalar multiple of vector1, false otherwise
function isScalarMultiple(vector1: math.Matrix, vector2: math.Matrix) {
  console.log("Vec1: " + vector1);
  console.log("Vec2: " + vector2);

  // Check that lengths are equal
  const len = math.max(math.size(vector1));
  if (len!==math.max(math.size(vector2))) {
    return false;
  }

  const zeroTolerance = 0.0001;
  const valueTolerance = 0.01;

  let bothAllZero = true;
  let scalar = null;
  for (let i=0; i<len; i++) {
    let val1 = vector1.get([i]);
    let val2 = vector2.get([i]);

    let val1zero = floatsEquivalent(val1,0,zeroTolerance);
    let val2zero = floatsEquivalent(val2,0,zeroTolerance);
    if (val1zero !== val2zero) {
      // one value is zero, but not the other
      return false;
    }

    if (bothAllZero && (!val1zero || !val2zero)) {
      // at least one value is non-zero
      bothAllZero = false;
    }

    if (scalar===null
        && !val1zero
        && !val2zero) {
          scalar = val1 / val2;
    }
    let val2ByScalar = val2 * scalar;
    let val1IsMultByScalar = floatsEquivalent(val2ByScalar, val1, valueTolerance);

    if (!val1IsMultByScalar) {
      return false;
    }
  }

  if (bothAllZero) {
    return true;
  }

  if (scalar===null) {
    // one vector is all zeros, the other isn't
    return false;
  }

  return true;
}


// Returns true if two floats are equivalent, within tolerance
function floatsEquivalent(float1: number, float2: number, tolerance: number) {
  return Math.abs(float1 - float2) < tolerance;
}

// Returns row from matrix as a vector
function getRowAsVector(m: math.Matrix, row: number) {
  let rowMatrix = (math as any).row(m, row); //row not defined in types???
  let len = math.max(math.size(rowMatrix));
  let rowVector = math.reshape(rowMatrix, [len]);
  return rowVector as math.Matrix;
}