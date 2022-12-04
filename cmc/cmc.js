(function () {
	// To remove the irrelevant lines from the course page
	const remove0CreditRows = () =>
		[...document.querySelectorAll("#delivery ~ div tr")]
			.filter((elem) => elem.children[2].textContent == 0)
			.forEach((elem) => elem.remove());

	// For module pages
	// Loads customised tailwind
	let setUp = () => {
		const tailwind = document.createElement("link");
		tailwind.href = "https://andrewstanton.tech/cmc/style.css";
		tailwind.rel = "stylesheet";
		document.querySelector("head").appendChild(tailwind);
	};

	const caseOverride = (textIn, substitutions) => {
		let temp = textIn;
		substitutions.forEach(
			([pattern, replacement]) =>
				(temp = temp.replace(pattern, replacement))
		);
		return temp;
	};

	const titleCase = (inputText) => {
		const baseSubstitutions = [
			["And ", "and "],
			["A ", "a "],
			["From ", "from "],
			["Or ", "or "],
			["Of ", "of "],
			["The ", "the "],
			["In ", "in "],
			["On ", "on "],
			["To ", "to "],
			["For ", "for "],
			["3d", "3D"],
			["Cci", "CCI"],
			["Ma ", "MA "],
			["Msc", "MSc"],
			["&", "and"],
			["Llm", "LLM"],
			["Tesol", "TESOL"],
		];
		return caseOverride(
			inputText
				.toLowerCase()
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
			baseSubstitutions
		);
	};

	// Pick the data from the page
	let extractDataFromPageBody = () => {
		const moduleName = titleCase(document.querySelector("h1").innerText);
		const moduleCode = document
			.querySelector("#subBar")
			.textContent.split(" ")[2];

		const [creditsExtract, levelExtract] = document.querySelectorAll(
			"#keyInformation ~ div .col"
		);
		const credits = creditsExtract.textContent.split(" ")[1];
		const level = levelExtract.textContent.split(" ")[1];
		
		const listedOutcomes = [...document.querySelectorAll("#outcomeDetails p")]
		    .map(({textContent}) => `<li>${textContent.trim()}</li>`);

		const learningOutcomes = `
<ul>
	${[... new Set(listedOutcomes)].join("\n\t")}
</ul>`;

		return { moduleName, moduleCode, credits, level, learningOutcomes };
	};

	// Is this module at masters level and have credits?
	let validateExtractedData = ({ credits, level, learningOutcomes }) => {
		let noErrors = true;
		const tests = [
			{
				test: () => !isNaN(credits) && Number.parseInt(credits) > 0,
				warningMessage: "This module has no credits",
			},
			{
				test: () => level === "7" || level === "6",
				warningMessage: "This module isn't for level 7",
			},
			{
				test: () => !!learningOutcomes.length,
				warningMessage: "This module has no learning outcomes",
			},
		];
		results = tests.map(({ test, warningMessage }) => {
			const result = test();
			if (!result) {
				alert(warningMessage);
				noErrors = false;
			}
		});
		return noErrors;
	};

	// Create a styled link to the current page
	const makeLink = () => {
		const link = document.createElement("a");
		link.classList.add("button-primary--small");
		link.title = "Directs you to Student View. A new window will open.";
		link.target = "_blank";
		link.innerText = "Explore this module";
		link.href = location.href;

		return link;
	};

	// Name for component in sitecore
	const generateModuleName = ({ moduleName, moduleCode, credits, level }) => {
		const enhancedModuleName = caseOverride(moduleName, [
			[",", ""],
			[":", ""],
			["/", " "],
			["(", ""],
			[")", ""],
		]);
		return `${enhancedModuleName} - L${level} - ${credits} credits - ${moduleCode} CMC`;
	};

	// The accordion header
	const generateModuleHeader = ({ moduleName, credits }) =>
		`<h5>${moduleName} &ndash; ${credits} credits</h5>`;

	const generateModuleBody = ({ learningOutcomes }) =>
		`<p class="SubHeading">The learning outcomes of this module are:</p>
${learningOutcomes}

<p>${makeLink().outerHTML}</p>`;

	// Start putting things on the screen
	const buildModal = (extractions) => {
		const container = document.createElement("section");
		const content = document.createElement("div");

		container.classList.add(
			"fixed",
			"inset-0",
			"bg-uop_bg/75",
			"cursor-not-allowed",
			"transition",
			"duration-500"
		);
		container.addEventListener("click", (e) => {
			if (e.target === container) {
				container.classList.add("translate-x-full");
				container.classList.remove("bg-uop_bg/75");
				setTimeout(() => container.remove(), 1000);
			}
		});
		content.style.gridTemplateColumns = "1fr 1fr 6fr";
		content.classList.add(
			"bg-uop_bg",
			"w-4/5",
			"mx-auto",
			"my-16",
			"p-16",
			"border-l-[16px]",
			"border-uop_light",
			"shadow-[-16px_0px]",
			"shadow-uop_dark",
			"grid",
			"gap-8",
			"cursor-auto"
		);

		data = [
			{
				attrName: "Component name",
				attrData: generateModuleName(extractions),
			},
			{
				attrName: "Header",
				attrData: generateModuleHeader(extractions),
			},
			{
				attrName: "Body",
				attrData: generateModuleBody(extractions),
			},
		];
		data.forEach((dataItem) => {
			makeLabeledCopyableTextbox(dataItem, content);
		});

		container.appendChild(content);
		document.querySelector("body").appendChild(container);
	};

	// A component to display each piece of data
	const makeLabeledCopyableTextbox = ({ attrName, attrData }, content) => {
		const h2 = document.createElement("h2");
		const button = document.createElement("button");
		const code = document.createElement("code");

		h2.innerText = attrName;
		h2.classList.add("text-2xl", "text-uop_dark");

		button.innerText = "Copy";
		button.classList.add(
			"p-4",
			"text-slate-50",
			"font-semibold",
			"text-lg",
			"bg-uop_cta",
			"hover:bg-uop_interact",
			"transition"
		);
		button.addEventListener("click", () => {
			navigator.clipboard.writeText(attrData).then(
				() => {
					button.classList.replace("bg-uop_cta", "bg-uops_cta");
					button.classList.replace(
						"hover:bg-uop_interact",
						"hover:bg-uops_interact"
					);
				},
				() => console.warn("Didn't copy")
			);
		});

		code.innerText = attrData;
		code.classList.add("overflow-y-auto", "max-h-48", "text-uop_light");

		[h2, button, code].forEach((elem) => content.appendChild(elem));
	};

	const run = () => {
		const extractions = extractDataFromPageBody();

		if (!validateExtractedData(extractions)) {
			return;
		}

		buildModal(extractions);
	};

	const performCourseSearch = () => {
		const searchURLBase =
			"https://course-module-catalog.port.ac.uk/#/search/courses/2022%2F23/";
		const searchTerm = prompt(
			"You're not on the Course Module Catalogue, enter a search term or press cancel:"
		);
		if (typeof searchTerm === "string" && searchTerm.length) {
			open(`${searchURLBase}${searchTerm}`, "_blank");
		}
	};

	if (location.hostname !== "course-module-catalog.port.ac.uk") {
		performCourseSearch();
	} else {
		const path = location.hash.split("/")[1];
		switch (path) {
			case "courseDetail":
				remove0CreditRows();
				break;
			case "moduleDetail":
				setUp();
				run();
				break;
			default:
				performCourseSearch();
				break;
		}
	}
})();
