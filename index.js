#!/usr/bin/env node

const fs = require("fs").promises

const timeApiUrl =
	"https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt"

const dataFilePath =
	"/home/safty/Desktop/prayer_block/prayer-time-locker/times.json"

async function fetchTime() {
	try {
		const response = await fetch(timeApiUrl)
		const data = response.json()
		console.log("data fetched")
		return data
	} catch (error) {
		console.error("Error fetching time from API:", error)
		process.exit(1)
	}
}

async function saveData(data) {
	try {
		await fs.writeFile(dataFilePath, JSON.stringify(data))
		console.log("Data saved successfully.")
	} catch (error) {
		console.error("Error saving data:", error)
	}
}

async function loadData() {
	try {
		const data = await fs.readFile(dataFilePath, "utf-8")
		return JSON.parse(data)
	} catch (error) {
		console.error("Error loading data:", error)
		return null
	}
}

const getPrayTime = (pray) => {
	const [hours, minutes] = pray.split(":").map(Number)
	const currentDate = new Date()
	currentDate.setHours(hours, minutes, 0, 0)
	return currentDate
}

function shouldSleep(currentTime, sleepTimes) {
	return sleepTimes.some((pray) => {
		const prayDate = getPrayTime(pray)
		const tenMinBefore = new Date(prayDate).getTime() - 60 * 1000 * 5
		const prayTime = new Date(prayDate).getTime()

		return currentTime <= prayTime && currentTime >= tenMinBefore
	})
}

async function main() {
	const savedData = await loadData()

	const currentDate = new Date().getTime()

	const shouldFileNotUpdate =
		new Date(savedData.fileDate).toLocaleDateString() ===
		new Date(currentDate).toLocaleDateString()

	let praysData

	if (shouldFileNotUpdate) {
		praysData = savedData
	} else {
		const todayData = (await fetchTime()).data
		praysData = {
			praysTimes: todayData.timings,
			fileDate: new Date(todayData.date.readable),
		}
		await saveData(praysData)
	}

	if (shouldSleep(currentDate, Object.values(praysData.praysTimes))) {
		console.log("It's sleep time. Putting the system to sleep...")
		// Uncomment the following line to trigger sleep (requires sudo privileges)
		require("child_process").execSync("sudo systemctl suspend")
		// If you want your script to lock the screen
		// require("child_process").execSync("gnome-screensaver-command -l")
	} else {
		console.log("It's not time to sleep yet.")
	}
}

main()
