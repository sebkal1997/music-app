const MIDI_NUM_NAMES = ["C_1", "C#_1", "D_1", "D#_1", "E_1", "F_1", "F#_1", "G_1", "G#_1", "A_1", "A#_1", "B_1",
                "C0", "C#0", "D0", "D#0", "E0", "F0", "F#0", "G0", "G#0", "A0", "A#0", "B0",
                "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
                "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
                "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
                "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
                "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
                "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
                "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
                "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8",
                "C9", "C#9", "D9", "D#9", "E9", "F9", "F#9", "G9"];
const playButton = document.querySelector('#playButton');

// SYNTH
const synth = new Tone.Synth().toDestination();

//	PIANO
const piano = new Tone.PolySynth(Tone.Synth, {
  "volume" : -8,
  "oscillator" : {
      "partials" : [1, 2, 5],
  },
  "portamento" : 0.005
}).toDestination();

const familyOfTriads = [[0,4,7],[0,3,7],[0,3,6],[0,4,8]];
const MAJOR_SCALE = [0,2,4,5,7,9,11,12];
const NATURAL_MINOR_SCALE = [0,2,3,5,7,8,10,12];
const HARMONIC_MINOR_SCALE = [0,2,3,5,7,8,11,12];
const MELODIC_MINOR_SCALE = [0,2,3,5,7,9,11,12];

const romanNumeralToIndex = {
  "I": 0,
  "II": 1,
  "III": 2,
  "IV": 3,
  "V": 4,
  "VI": 5,
  "VII": 6,
};


// assume the user selects from a menu option such as the following
{/*
<select name="root" id="root">
<option value="57">A
</option><option value="58">Bb
</option><option value="59">B
</option><option value="60">C
</option><option value="61">C#
</option><option value="61">Db
</option><option value="62">D
</option><option value="63">Eb
</option><option value="64">E
</option><option value="65">F
</option><option value="66">F#
</option><option value="66">Gb
</option><option value="67">G
</option><option value="68">Ab
</option><option value="69">A
</option></select>
*/}

function updateTempo(tempo)  {
	Tone.Transport.bpm.value = tempo   
}

function getScaleFormula(scaleType) {
  if(scaleType === "Major") {
      return MAJOR_SCALE;
  } else if(scaleType === "NaturalMinor") {
      return NATURAL_MINOR_SCALE;
  } else if(scaleType === "HarmonicMinor") {
      return HARMONIC_MINOR_SCALE;
  } else if(scaleType === "MelodicMinor") {
      return MELODIC_MINOR_SCALE;
  } else {
      return NATURAL_MINOR_SCALE;
  }
}

function makeChordArray(root, chordFormula, timeInterval) {
  var indexMIDI
  var aChord = [];
  var timeAndChord = [];
  let cummulativeTime = Tone.Time('0');
  var chordArray = [];
  updateTempo(60);
  for(let i=0; i<chordFormula.length; i++) {
      for(var j=0; j<chordFormula[i].length; j++) {
          // add the root to each chord tone
          indexMIDI = chordFormula[i][j] + Number(root);
          // tranlate to a pitch/octave name
          aChord.push(MIDI_NUM_NAMES[indexMIDI]);
      }
  // create add time and chord together
  timeAndChord.push(Tone.Time(cummulativeTime).toSeconds());
  timeAndChord.push(aChord);
      chordArray.push(timeAndChord);
      cummulativeTime = Tone.Time(Tone.Time(cummulativeTime) + Tone.Time(timeInterval));
  // clear the arrays;
  aChord = [];
  timeAndChord = [];
  }
  console.log(chordArray);
  return chordArray;
}

function playFamilyOfTriads() {
  const root = 61;
  myChords = makeChordArray(root, familyOfTriads, '2n');
  const tempo = 60;
  Tone.Transport.bpm.value = tempo;   

  var chordPart = new Tone.Part(function(time, chord){
    piano.triggerAttackRelease(chord, "2n", time);
  }, myChords ).start(0);

  chordPart.loop = true;
  chordPart.loopStart = "0:0";
  chordPart.loopEnd = "2:0";

  Tone.Transport.start("+0.1");
}
  
function createDiatonicTriadFormula_OneOctave(scaleDegreeRoot, scale) {
  var useMajorV = false;
    var oneChord = [];
    oneChord.push(scale[scaleDegreeRoot % 7]);
    if(useMajorV && scaleDegreeRoot==4 && scale == NATURAL_MINOR_SCALE) {
        oneChord.push(scale[(scaleDegreeRoot+2) % 7]+1);
    } else {
        oneChord.push(scale[(scaleDegreeRoot+2) % 7]);
    }
    oneChord.push(scale[(scaleDegreeRoot+4) % 7]);
    return oneChord;
}


function playChordProgression() {
  root = 61;
  
  var chordProgStr = "I-IV-V-I";
  var chordProgArr = chordProgStr.split("-");
  var oneChord = [];
  var chordArray = [];
  var scale = getScaleFormula("Major");
  
  for(let i=0; i<chordProgArr.length; i++) {
      var index = romanNumeralToIndex[chordProgArr[i]];
      oneChord = createDiatonicTriadFormula_OneOctave(index, scale);
      chordArray.push(oneChord);
  }
  myChords = makeChordArray(root, chordArray, '2n');

  var tempo = 60;
  Tone.Transport.bpm.value = tempo;   

  var chordPart = new Tone.Part(function(time, chord){
    piano.triggerAttackRelease(chord, "2n", time);
  }, myChords ).start(0);

  chordPart.loop = true;
  chordPart.loopStart = "0:0";
  chordPart.loopEnd = "2:0";

  Tone.Transport.start("+0.1");
}

function play() {
    console.log("Start playing music.")
    if (Tone.context.state !== "running") {
        Tone.start();
      }
      synth.triggerAttackRelease("C4", "4n");
}

playButton.addEventListener("click", playChordProgression, true);
