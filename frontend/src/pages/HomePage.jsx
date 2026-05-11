import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../datastore/data'

const HomePage = () => {
    const [file, setFile] = useState(null)
    const navigate = useNavigate()
    const { updateData } = useData()

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!file) {
            alert("Please select a CSV file")
            return
        }

        const formData = new FormData()
        formData.append("file", file)

        try {
            const fetchResponse = await fetch("https://axperiments.onrender.com/upload-csv", {
                method: "POST",
                body: formData,
            })

            if (!fetchResponse.ok) {
                throw new Error(`HTTP error! status: ${fetchResponse.status}`)
            }

            const response = await fetchResponse.json()
            console.log("Upload response:", response)

            // Store the entire response in the state
            updateData(response)
            alert("File uploaded successfully!")
            navigate("/best-model")

        } catch (error) {
            console.error("Upload error:", error)
            alert("Upload failed: " + error.message)
        }
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    return (
        <div className='flex flex-col justify-center items-center min-h-screen bg-gray-50'>
            <div className='text-center max-w-md w-full px-4'>
                <h1 className='text-3xl mb-2 text-gray-800 font-bold'>Axperiments - Geo Analyzer</h1>
                <p className='text-sm text-gray-600 mb-8'>Upload CSV data for synthetic control analysis</p>

                <form onSubmit={onSubmit} className='space-y-4 mb-8'>
                    <input
                        className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    <button
                        className='w-full bg-blue-500 text-white px-4 py-2 rounded font-medium hover:bg-blue-600 transition-colors'
                        type='submit'
                    >
                        Upload & Analyze
                    </button>
                </form>

                <div className='text-xs text-gray-500 space-y-1'>
                    <p>Required: date, geo, leads columns</p>
                    <p>Supports CSV format only</p>
                </div>

                <div className='mt-12 pt-8 border-t border-gray-200'>
                    <p className='text-xs text-gray-500 italic'>
                        Built with synthetic control methodology
                    </p>
                    <p className='text-xs text-gray-600 mt-2'>
                        A project by Abdul Rehman Shoukat
                    </p>
                </div>
            </div>
        </div>
    )
}

export default HomePage