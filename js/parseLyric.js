function parseLyric(lyric) {
	const lrcObj = {
		ti: "",
		ar: "",
		al: "",
		by: "",
		lrc: [],
	};
	
	/*
		[ar:艺人名]
		[ti:曲名]
		[al:专辑名]
		[by:编者（指编辑LRC歌词的人）]
		[offset:时间补偿值] 其单位是毫秒，正值表示整体提前，负值相反。这是用于总体调整显示快慢的。
	*/

	const lrcArr = lyric
		.split("\n")
		.filter(function (value) {
			// 1. use '\n' to parse each line and remove white space and empty line
			return value.trim() !== "";
		})
		.map(function (value) {
			// 2. parse the lyrics
			const line = parseLyricLine(value.trim());
			// console.log(line);
			if (line.type === "lyric") {
				lrcObj.lrc.push(line.data);
			} else {
				lrcObj[line.type] = line.data;
			}
			return value.trim();
		});
	
		function parseLyricLine(line) {
			const tiArAlByExp = /^\[(ti|ar|al|by|offset):(.*)\]$/;
			const lyricExp = /^\[(\d{2}):(\d{2})(?:[\.:](\d+))?\](.*)/;
			let result;
			if ((result = line.match(tiArAlByExp)) !== null) {
				return {
					type: result[1],
					data: result[2],
				};
			} else if ((result = line.match(lyricExp)) !== null) {
				const min = parseInt(result[1]);
				const sec = result[2];
				const msStr = result[3] || "0";
				const timeMs = min * 60 * 1000 + parseFloat(sec + "." + msStr) * 1000;
				return {
					type: "lyric",
					data: {
						timeMs: timeMs,
						lyric: result[4].trim(),
					},
				};
			}
		}
	
		return lrcObj;
	}

window.parseLyric = parseLyric