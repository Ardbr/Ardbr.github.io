document.addEventListener('DOMContentLoaded', () => {

    function calculateDaysUntil(targetDate) {
        const target = new Date(targetDate)
        const today = new Date()
    
        const timeDiff = Math.abs(target - today)
    
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

        // year-2024    month-01    day-04
        const year = today.getFullYear(); // 2024
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')

        // weekDay
        const weekdays = ['日', '一', '二', '三', '四', '五', '六']
        const weekDay = weekdays[today.getDay()]

        return {
            diff: daysDiff,
            year: year,
            month: month,
            day: day,
            weekDay: weekDay
        }
    }

    const refreshCountdownFn = () => {
        const targetDate = '2026-01-01'
        const ret = calculateDaysUntil(targetDate)

        $countdownNumberEle = document.getElementsByClassName('countdown-number')[0]
        $currentTimeEle = document.getElementsByClassName('current-time')[0]
        $countdownNumberEle.innerText = ret.diff
        $currentTimeEle.innerText = `${ret.year} 年 ${ret.month} 月 ${ret.day} 日 星期${ret.weekDay}`
    }

    btf.addGlobalFn('pjaxComplete', refreshCountdownFn, 'refreshCountdownFn')
    refreshCountdownFn()
})
