import re
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings, ChatHuggingFace, HuggingFacePipeline
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
#from pandas import read_csv
#from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
#import torch
#import pandas as pd
from docx import Document as Docx
import uvicorn

load_dotenv()

from langchain.schema import Document
from sqlalchemy import create_engine,text
import requests


from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
react_port = 5172

origins = [
    f"http://localhost:{react_port}",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str

#-------------------------------------- Future api use if required ---------------------------------------------#



# dat_type = "Ground Water Level"  #Ground Water Level              #Rainwater
# state_name = "Odisha"
# district_name = "Baleshwar"
# agency_name = "cgwb"   #cgwb for groundwater              #cwc for rainwater
# start_date = "2025-09-06"   #yyyy-mm-dd
# end_date = "2025-09-07"

# api_url = f"https://indiawris.gov.in/Dataset/{dat_type}?stateName={state_name}&districtName={district_name}&agencyName={agency_name}&startdate={start_date}&enddate={end_date}&download=false&page=0&size=1"




#----------------------------- csv -> df -> sql conversion of tabular data ------------------------------#



database_name = 'ingres_data.db'
engine = create_engine(f'sqlite:///{database_name}')

# df = read_csv("State_wise_2020.csv",on_bad_lines="skip")
#
# try:
#     table_name = 'state_wise_2020'
#     df.to_sql(table_name, con=engine, if_exists='fail', index=False)
# except ValueError:
#     pass


#------------------------------- word file text parsing ----------------------------------------#



theory = Docx("ingres_data_word.docx")
clean_theory = []
for p in theory.paragraphs:
    clean_theory.append(re.sub(r'\s+', ' ', p.text))



#-------------------------------------- chunking process -----------------------------------------#


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=70
)
# print(clean_theory)
chunks = text_splitter.split_text("\n\n".join(clean_theory))
documents = [Document(page_content=chunk) for chunk in chunks]
# print(documents)


#------------------------------------- embedding model and vector store --------------------------------------#


embedding_model_id = "intfloat/e5-large-v2"
embeddings = HuggingFaceEmbeddings(
    model_name=embedding_model_id,
)

vector_store = Chroma(
    collection_name="ingres_data_1",
    embedding_function=embeddings,
    persist_directory="./chroma_langchain_db",
)

# vector_store.delete_collection()
# vector_store.add_documents(documents)

# print(vector_store._collection.count())


#------------------------------ SQl query chain -----------------------------------------#


from langchain.chains import create_sql_query_chain
from langchain_community.utilities import SQLDatabase

from langchain_community.utilities import SQLDatabase

db = SQLDatabase(engine)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
query_chain = create_sql_query_chain(llm, db)


#---------------------------------- alt model (local) ------------------------------------#



# model_id = "TheBloke/Mistral-7B-Instruct-v0.2-GGUF"
# tokenizer = AutoTokenizer.from_pretrained(model_id)
# bnb_config = BitsAndBytesConfig(
# load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype="float16"
# )
#
# model = AutoModelForCausalLM.from_pretrained(
#     model_id,
#     # quantization_config=bnb_config,
#     device_map="auto"
# )
#
# pipe = pipeline(task="text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     torch_dtype="auto",
#     do_sample=True,
#     temperature=0.1,
#     return_full_text=False,
#     max_new_tokens=200,
#     repetition_penalty=1.2)
#
# llm = HuggingFacePipeline(pipeline=pipe)


#------------------------------------ working process ----------------------------------------#



retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 2})

def qna(prompt):
    # prompt = input("Enter the query: ")
    result = retriever.invoke(prompt)
    # docs = retriever.get_relevant_documents(prompt)
    # user_q = "what is a rainy day"
    context=""
    try:
        sql = query_chain.invoke({"question": prompt})
        # If model adds `SQLQuery:` in front, clean it
        if sql.strip().lower().startswith("sqlquery:"):
            sql = sql.split(":", 1)[1].strip()
        context += sql + "\n sql result: "
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            rows = result.fetchall()
            for row in rows:
                context += str(row) + "\n"
            context += "\n thheory result: "

    except Exception as e:
        pass
    th_context = "\n".join([doc.page_content for doc in result])
    context = context + th_context
    # print(context)
    from langchain_core.messages import HumanMessage

    result = llm.invoke(f"Answer the query: {prompt} using ONLY the given context: {context}. You have two contexts, you can either choose one of them or both two answer the question. For any kind of numerical data refer only the sql context if given.")
    return result.content
    #
    #
    #
    #
    # final_prompt = f"""
    # You are a helpful assistant.
    # Answer the question based ONLY on the context below. Do not add extra explanations, do not repeat yourself. be as concise as possible. Do not round off any numerical value.
    #
    # Context: {context}
    #
    # Question: {prompt}
    #
    # Answer:
    # """
    #
    # output = llm.invoke(final_prompt)
    # print("Answer is: ",output)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.prompt
    answer = qna(user_message)
    return {"answer": answer}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)