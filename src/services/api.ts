import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
});

interface UserData {
  email: string;
  password: string;
}

function getConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post("/sign-up", signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>("/sign-in", signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
  views: number;
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

export type TestSearchByTeacher = TestByTeacher & {
  name?:string;
}

async function getTestsByDiscipline(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByDiscipline[] }>(
    "/tests?groupBy=disciplines",
    config
  );
}

async function getTestsByTeacher(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByTeacher[] }>(
    "/tests?groupBy=teachers",
    config
  );
}

async function getCategories(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ categories: Category[] }>("/categories", config);
}

async function getDisciplines(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ disciplines: Discipline[] }>("/disciplines", config);
}

async function getTeachers(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ teachers: Teacher[] }>("/teachers", config);
}

async function getTeachersDisiciplines(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ teachersDisciplines: TeacherDisciplines[] }>("/teachersdisciplines", config);
}

async function getSearchByDiscipline(token: string, searchText: string) {
  const config = getConfig(token)
  return baseAPI.get<{ tests: TestByDiscipline[] }>(
    `/tests/${searchText}/?groupBy=disciplines`,
    config
  );
}


async function getTestsSearchByTeachers(token: string, searchText: string) {
  const config = getConfig(token)
  return baseAPI.get<{ tests: TestByTeacher[] }>(
    `/tests/${searchText}/?groupBy=teachers`,
    config
  );
}


async function postCountViews(token: string, id: number) {
  const config = getConfig(token)
  return baseAPI.post(
    `/tests/${id}/views`,{},
    config
  );
}

async function insertTest(token: string, test: any) {
  const config = getConfig(token)
  return baseAPI.post(
    `/tests/`,test,
    config
  );
} 

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  getDisciplines,
  getTeachers,
  getTeachersDisiciplines,
  getSearchByDiscipline,
  getTestsSearchByTeachers,
  postCountViews,
  insertTest
};

export default api;
