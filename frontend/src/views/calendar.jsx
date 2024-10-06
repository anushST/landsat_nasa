import { useState } from "react";

export default function Calendar({ onDayClick, geoError }) {
    const [selectedDay, setSelectedDay] = useState(null); // State to keep track of the selected day
    const [currentDate, setCurrentDate] = useState(new Date(2024, 9)); // Start with October 2024
    const daysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const startDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const generateDaysArray = (year, month) => {
        const days = [];
        const numDays = daysInMonth(year, month);
        const firstDay = startDayOfMonth(year, month);
        let currentWeek = new Array(firstDay).fill(null); // Fill the first week with empty slots

        for (let day = 1; day <= numDays; day++) {
            currentWeek.push(day);
            if (currentWeek.length === 7 || day === numDays) {
                days.push(currentWeek);
                currentWeek = [];
            }
        }
        return days;
    };

    const handleDayClick = (day) => {
        if (day !== null) {
            setSelectedDay(day); // Update the selected day

            const selectedDate = new Date(
                currentDate.getFullYear(), 
                currentDate.getMonth(), 
                day
            );
    
            // Format the date to YYYY-MM-DD
            const formattedDate = selectedDate.toISOString().split('T')[0];
           onDayClick(formattedDate);
        }

        
    };

    const handlePrevMonth = () => {
        setCurrentDate((prevDate) => {
            const newMonth = prevDate.getMonth() - 1;
            return new Date(prevDate.getFullYear(), newMonth);
        });
    };

    const handleNextMonth = () => {
        setCurrentDate((prevDate) => {
            const newMonth = prevDate.getMonth() + 1;
            return new Date(prevDate.getFullYear(), newMonth);
        });
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = generateDaysArray(currentDate.getFullYear(), currentDate.getMonth());

    return (
        <div className="p-4">
        <div>
            <h1 className="text-center text-2xl font-bold">Acquisition Plan Viewer</h1>
            <p>Here you can browse the most up to date raw acquisition plan data used by spectator.earth to determine if a satellite will be imaging at a particular time and location.</p>
        </div>
            <div className="flex items-center justify-center py-8 px-4">
            <div className="max-w-sm w-full shadow-lg">
                <div className="md:p-8 p-5 bg-black rounded-t">
                    <div className="px-4 flex items-center justify-between">
                        <span tabIndex="0" className="focus:outline-none text-base font-bold dark:text-gray-100 text-gray-800">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <div className="flex items-center">
                            <button aria-label="calendar backward" onClick={handlePrevMonth} className="focus:text-gray-400 hover:text-gray-400 text-gray-800 dark:text-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-chevron-left" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <polyline points="15 6 9 12 15 18" />
                                </svg>
                            </button>
                            <button aria-label="calendar forward" onClick={handleNextMonth} className="focus:text-gray-400 hover:text-gray-400 ml-3 text-gray-800 dark:text-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <polyline points="9 6 15 12 9 18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-12 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th><div className="w-full flex justify-center text-red-500"><p className="text-base font-medium text-center text-red-500">Mo</p></div></th>
                                    <th><div className="w-full flex justify-center text-red-500"><p className="text-base font-medium text-center text-red-500">Tu</p></div></th>
                                    <th><div className="w-full flex justify-center text-red-500"><p className="text-base font-medium text-center text-red-500">We</p></div></th>
                                    <th><div className="w-full flex justify-center text-red-500"><p className="text-base font-medium text-center text-red-500">Th</p></div></th>
                                    <th><div className="w-full flex justify-center text-red-500"><p className="text-base font-medium text-center text-red-500">Fr</p></div></th>
                                    <th><div className="w-full flex justify-center text-red-500"><p className="text-base font-medium text-center text-red-500">Sa</p></div></th>
                                    <th><div className="w-full flex justify-center text-red-500"><p className="text-base font-medium text-center text-red-500">Su</p></div></th>
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((week, weekIndex) => (
                                    <tr key={weekIndex}>
                                        {week.map((day, dayIndex) => (
                                            <td key={dayIndex} className="pt-6">
                                                <div
                                                    className={`px-2 py-2 cursor-pointer flex w-full justify-center ${day === selectedDay ? 'bg-indigo-700 text-white rounded-full' : 'text-gray-500 dark:text-gray-100 font-medium'}`}
                                                    onClick={() => handleDayClick(day)}
                                                >
                                                    {day && <p>{day}</p>}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div>
            {/* <span className="text-red-500">{geoData ? '': 'No data found with this date'}</span> */}
        </div>
        </div>
    );
}