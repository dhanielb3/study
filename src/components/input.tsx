import { ChangeEventHandler } from "react";

export default function InputText({ title, placeholder, type, onChange=()=>{}, value="" }: {title: string, placeholder: string, type: string, onChange?: ChangeEventHandler<HTMLInputElement>, value?: string}) {
    return (
        <div className="my-4">
            <span className="text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">{title}</span><br></br>
            <input className="text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)] border-2 border-gray-500 rounded-xl w-[20vw] p-[1vh]" placeholder={placeholder} type={type} onChange={onChange} value={value}></input>
        </div>
    )
}