import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  TeacherDisciplines,
  Test,
  TestByTeacher,
  TestSearchByTeacher
} from "../services/api";
import { DebounceInput } from "react-debounce-input";

function Instructors() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [teachersDisciplines, setTeachersDisciplines] = useState<
    TestByTeacher[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState<TestSearchByTeacher[]>([]);
  
  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByTeacher(token);
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token]);

  useEffect(() => {
    if(searchText === "") return
    async function searchByDiscipline() {
      if (!token) return;
      const {data: searchData} = await api.getTestsSearchByTeachers(token,searchText)
      setSearch(searchData.tests)
    }
    searchByDiscipline();
  }, [searchText]);
  return (
    <>
      <DebounceInput 
        minLength={1}
        debounceTimeout={300}
        onChange={(e) => setSearchText(e.target.value)}
        element={TextField}
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        label="Pesquise por disciplina"
      />
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          categories={categories}
          teachersDisciplines={teachersDisciplines}
          searchText = {searchText}
          search = {search}
        />
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
  searchText: string;
  search: TestSearchByTeacher[];
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
  searchText,
  search
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines);
  const teste = getUniqueTeachersBySearch(search);
  if(searchText !== ""){
  return (
    <Box sx={{ marginTop: "50px" }}>
      {teste.map((teacher) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{teacher}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {categories
              .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
              .map((category) => (
                <Categories
                  key={category.id}
                  category={category}
                  teacher={teacher}
                  teachersDisciplines={teachersDisciplines}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
  } else
  return (
    <Box sx={{ marginTop: "50px" }}>
      {teachers.map((teacher) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{teacher}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {categories
              .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
              .map((category) => (
                <Categories
                  key={category.id}
                  category={category}
                  teacher={teacher}
                  teachersDisciplines={teachersDisciplines}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function getUniqueTeachersBySearch(search: TestSearchByTeacher[]) {
  return [
    ...new Set(
      search.map(
        (search) => search.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string | undefined,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string | undefined;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ marginBottom: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />
          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
}

function Tests({ tests, disciplineName }: TestsProps) {
  const { token } = useAuth();
  async function countViews(id: number) {
    if (!token) return;
    await api.postCountViews(token,id)
  }
  return (
    <>
      {tests.map((test) => (
        <Typography key={test.id} color="#878787">
          <Link
            onClick={() => countViews(test.id)}
            href={test.pdfUrl}
            target="_blank"
            underline="none"
            color="inherit"
          >{`${test.name} (${disciplineName}) ${test.views}`}</Link>
        </Typography>
      ))}
    </>
  );
}

export default Instructors;
