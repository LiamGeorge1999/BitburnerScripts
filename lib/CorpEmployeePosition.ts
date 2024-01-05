export enum CorpEmployeePosition {
	Unassigned = "Unassigned",
    Operations = "Operations",
    Engineer = "Engineer",
    Business = "Business",
    Management = "Management",
    ResearchAndDevelopment = "Research & Development",
    Intern = "Intern"
}

export const WorkingEmployeePositions = [CorpEmployeePosition.Operations,
                                        CorpEmployeePosition.Engineer,
                                        CorpEmployeePosition.Business,
                                        CorpEmployeePosition.Management,
                                        CorpEmployeePosition.ResearchAndDevelopment,
                                        CorpEmployeePosition.Intern];