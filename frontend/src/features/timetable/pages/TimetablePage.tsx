import { TimetableTable } from "../components/TimetableTable";
import { TimetableToolbar } from "../components/TimetableToolbar";
import { useTimetableData } from "../hooks/useTimetableData";
import { useTimetableFilters } from "../hooks/useTimetableFilters";

const TimetablePage = () => {
	const { items } = useTimetableData();
	const {
		searchTerm,
		setSearchTerm,
		filterDay,
		setFilterDay,
		filterRoom,
		setFilterRoom,
		filterLecturer,
		setFilterLecturer,
		filteredItems,
	} = useTimetableFilters(items);

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-gray-900">Timetable Management</h1>
				<p className="text-gray-600 mt-1">Manage course schedules and room assignments</p>
			</div>

			<TimetableToolbar
				searchTerm={searchTerm}
				onSearchTermChange={setSearchTerm}
				filterDay={filterDay}
				onFilterDayChange={setFilterDay}
				filterRoom={filterRoom}
				onFilterRoomChange={setFilterRoom}
				filterLecturer={filterLecturer}
				onFilterLecturerChange={setFilterLecturer}
			/>

			<TimetableTable items={filteredItems} />
		</div>
	);
};

export default TimetablePage;
