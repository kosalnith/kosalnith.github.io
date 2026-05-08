let filterButton = document.querySelector("button.filters-cta");

const presets = [
	"filter-preset-1",
	"filter-preset-2",
	"filter-preset-3",
	"filter-preset-4",
	"filter-preset-5",
	"filter-preset-6",
	"filter-preset-7",
	"filter-preset-8",
	"filter-preset-9",
	"filter-preset-10",
	"filter-preset-11",
	"filter-preset-12",
	"filter-preset-13",
	"filter-preset-14",
	"filter-preset-15",
	"filter-preset-16"
];

filterButton.addEventListener("click", function () {
	let images = document.querySelectorAll(".image-container img");
	images.forEach((img) => {
		presets.forEach((preset) => {
			img.classList.remove(preset);
		});
		img.classList.add(getRandomPreset());
	});
});

function getRandomPreset() {
	const randomIndex = Math.floor(Math.random() * presets.length);
	return presets[randomIndex];
}