autowatch = 1;
//This is all the panning. Adjust here.
var panning = [
	[ 0.5 ],
	[ 0.33, 0.66 ],
	[ 0.33,  0.5, 0.66 ],
	[ 0.25, 0.375, 0.625, 0.75, ],
	[ 0.25, 0.375, 0.5, 0.625, 0.75 ],
	[ 0.2, 0.32, 0.44, 0.56, 0.68, 0.8 ],
	[ 0.15, 0.27, 0.39, 0.5, 0.62, 0.74, 0.85 ],
	[ 0.10, 0.20, 0.30, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
];

var activeChannelBuffer = new Buffer("activeChannels");
var panningOutput = createBlankPanningArray(activeChannelBuffer);
var firstChannelToPan = 0;
 //this is set in the object. It's the sample where we should look in the panning buffer
var activeSample = jsarguments[1];

function bang() {
	var activeChannels = getActiveChannels();
	var numberChannelsActive = accumChannels(activeChannels);

	// If there's only one channel active, record the index.
	if (numberChannelsActive === 1) {
		rememberFirstChannel(numberChannelsActive, activeChannels);
	}

	//only worry about this if there's something actually playing!
	if (numberChannelsActive > 0) {
		panningOutput = buildPanningArray(numberChannelsActive, firstChannelToPan);
	}

	outlet(0, panningOutput);
}

// reset when the pedal goes up. This won't output until next bang. 
function msg_int(int) {
	if (int == 0) {
		panningOutput = createBlankPanningArray(activeChannelBuffer);
	}
}

//====================HELPER FUNCTIONS======================
//loop through and get an array of all channels and if they're active
function getActiveChannels() {
	var numberOfChannels = activeChannelBuffer.channelcount();
	var activeChannels = [];
	//we use i=1 here because the the channel counting starts on 1
	for (i=0; i<numberOfChannels; i++) {
		var thisChannel = activeChannelBuffer.peek(i + 1, activeSample);
		activeChannels.push(thisChannel)
	}

	return activeChannels;
}

function accumChannels(activeChannels) {
	var channelAccum = 0;
	for (i=0; i < activeChannels.length; i++) {
		channelAccum += activeChannels[i];
	}

	return channelAccum;
}

//if this is the first channel, remember the index.
function rememberFirstChannel(numberChannelsActive, activeChannels) {
	for (i=0; i < activeChannels.length; i++) {
		if (activeChannels[i] === 1) {
			firstChannelToPan = i;
		}
	}
}

function createBlankPanningArray(activeChannelBuffer) {
	var panningOutput = [];
	for(i=0; i < activeChannelBuffer.channelcount(); i++) {
		//0.5 is center.
		panningOutput[i] = 0.5;
	}

	return panningOutput;
}

function buildPanningArray(numberChannelsActive, firstChannelToPan) {
	var neededPan = panning[numberChannelsActive-1];

	for(i=0; i < neededPan.length; i++) {
		/* because the first recorded channel could be anything, this wraps the array from the
		end of the array to the end */
		var panningArrayIndex = (firstChannelToPan + i) % panningOutput.length;
		panningOutput[panningArrayIndex] = neededPan[i];
	}

	return panningOutput;
}
