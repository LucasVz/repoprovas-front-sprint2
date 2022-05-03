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
  Autocomplete
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";
import { DebounceInput } from "react-debounce-input";
import internal from "stream";
import { stringify } from "querystring";

function AddTests(){
  const navigate = useNavigate();
  const teste = ["casa"];
  const { token } = useAuth();
  const [testText, setTestText]= useState("")
  const [linkText, setLinkText]= useState("")
  const [formData, setFormData]= useState<any>(
    {
      title: "",
      pdfUrl: "",
      category: "",
      discipline: "",
      teacher: "",
    }
  )
  const [options, setOptions]= useState<any>(
    {category:[],
    discipline:[],
    teacher:[],
    teachersDisciplines:[],
    })

  useEffect(() => {
  async function getOptions() {
    if (!token) return;

    const category = await api.getCategories(token);
    const discipline = await api.getDisciplines(token);
    const teacher = await api.getTeachers(token);
    const teachersDisciplines = await api.getTeachersDisiciplines(token);
    setOptions({
        category: category.data.categories,
        discipline: discipline.data.disciplines,
        teacher: teacher.data.teachers,
        teachersDisciplines: teachersDisciplines.data.teachersDisciplines
      });
  }
    getOptions();
  }, [token]);

  function handleAutocompleteChange(name: string, value: any) {
    setFormData({ ...formData, [name]: value });
  }

  function handleInputChange(event: any){
    const {
      target: {name, value}
    } = event;
    setFormData({ ...formData, [name]: value });
   }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const test = {
      title: formData.title,
      pdfUrl: formData.pdfUrl,
      categoryId: options.category.find(
        (category: any) => category.name === formData.category
      ).id,
      disciplineId: options.discipline.find(
        (discipline: any) => discipline.name === formData.discipline
      ).id,
      teacherId: options.teacher.find(
        (teacher: any) => teacher.name === formData.teacher
      ).id,
    };
    if (!token) return;
    await api.insertTest(token, test);
  }
  return(
    <>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        component="form"
        onSubmit={handleSubmit}
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
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="contained" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
          
        <TextField 
          id="outlined-basic" 
          label="Nome da prova" 
          variant="outlined" 
          name="title"
          sx={{ marginTop: "40px", marginBottom: "25px", width: "700px" }}
          onChange={(e) => handleInputChange(e)}
        />

        <TextField 
          id="outlined-basic" 
          label="Link da prova" 
          variant="outlined"
          name="pdfUrl"
          sx={{ marginx: "auto", marginBottom: "25px", width: "700px" }}
          onChange={(e) => handleInputChange(e)}
        />

        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={options.category.map((option: any) => option.name)}
          sx={{ marginX: "auto", marginBottom: "25px", width: "700px" }}
          onInputChange={(e, value) =>
            handleAutocompleteChange("category", value)
          }
          renderInput={(params) => <TextField {...params} label="Categoria" />}
        />

        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={options.discipline.map((option: any) => option.name)}
          sx={{ marginX: "auto", marginBottom: "25px", width: "700px" }}
          onInputChange={(e, value) =>
            handleAutocompleteChange("discipline", value)
          }
          renderInput={(params) => <TextField {...params} label="Disciplina" />}
        />

        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={
            formData.discipline && options.teachersDisciplines
              ? options.teachersDisciplines
                  .filter((option: any) => {
                    return option.discipline.name === formData.discipline;
                  })
                  .map((el: any) => el.teacher.name)
              : ["Escolha uma disciplina"]
          }
          sx={{ marginX: "auto", marginBottom: "25px", width: "700px" }}
          onInputChange={(e, value) =>
            handleAutocompleteChange("teacher", value)
          }
          renderInput={(params) => <TextField {...params} label="Pessoa instrutora" />}
        />
        <Button
          type="submit"
         sx={{ marginX: "auto", marginBottom: "60px", width: "700px" }} 
        variant="contained">Enviar</Button>
      </Box>
    </>
  );
}


export default AddTests;