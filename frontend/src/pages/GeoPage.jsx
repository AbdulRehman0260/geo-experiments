import React, { useState } from 'react'
import { useEffect } from 'react'

const GeoPage = () => {
    const [geoList, setGeoList] = useState(null)
    const [geoClicked, setGeoClicked] = useState(null)
    const [analysisData, setAnalysisData] = useState(null)
    const [plotData, setPlotData] = useState(null)
    const [effectSize, setEffectSize] = useState(0.10)

    const onClickGeo = (geo) => {
        setGeoClicked(geo)
        console.log("Clicked geo:", geo)
    };

    useEffect(() => {
        const fetchGeos = async () => {
            try {
                const response = await fetch("http://localhost:8000/get-geos", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                const data = await response.json()
                console.log("Fetched geos:", data)
                setGeoList(data)
            } catch (error) {
                console.error("Error fetching geos:", error)
                setGeoList({ error: error.message })
            }
        }
        fetchGeos()
    }, [])

    const fetchGeo = async (geo) => {
        try {
            const fetchResponse = await fetch("http://localhost:8000/analyze-geo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ geo: geo })
            })
            const response = await fetchResponse.json()
            console.log("Analysis response:", response)
            setAnalysisData(response)
            return response
        } catch (error) {
            console.error("Error analyzing geo:", error)
            const errorResponse = { error: error.message }
            setAnalysisData(errorResponse)
            return errorResponse
        }
    }

    const fetchPlot = async (geo, effectSize) => {
        try {
            console.log("Fetching plot for:", geo, "with effect size:", effectSize);
            const fetchResponse = await fetch("http://localhost:8000/generate-plot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ geo: geo, effect_size: effectSize })
            })

            if (!fetchResponse.ok) {
                throw new Error(`HTTP error! status: ${fetchResponse.status}`);
            }

            const response = await fetchResponse.json()
            console.log("Plot response:", response)
            setPlotData(response)
            return response
        } catch (error) {
            console.error("Error generating plot:", error)
            const errorResponse = { status: "error", message: error.message }
            setPlotData(errorResponse)
            return errorResponse
        }
    }

    if (!geoList) {
        return <div>Loading geos...</div>
    }

    if (geoList.error) {
        return <div>Error: {geoList.error}</div>
    }

    return (
        <div className='p-8'>
            <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl font-bold mb-6'>Geographic Analysis</h1>
                <div className='bg-white p-6 rounded-lg shadow mb-6'>
                    <h2 className='text-xl font-semibold mb-4'>Available Geographies</h2>

                    {geoClicked && (
                        <div className='mb-4 p-3 bg-blue-100 rounded'>
                            <strong>Selected:</strong> {geoClicked}
                            <button
                                onClick={() => fetchGeo(geoClicked)}
                                className='ml-4 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600'
                            >
                                Analyze
                            </button>
                            <div className='mt-3 flex items-center space-x-2'>
                                <label className='text-sm font-medium'>Effect Size:</label>
                                <input
                                    type="range"
                                    min="5"
                                    max="20"
                                    step="1"
                                    value={effectSize * 100}
                                    onChange={(e) => setEffectSize(parseInt(e.target.value) / 100)}
                                    className='w-32'
                                />
                                <span className='text-sm font-medium'>{(effectSize * 100).toFixed(0)}%</span>
                                <button
                                    onClick={() => {
                                        console.log("Generating plot with effect size:", effectSize);
                                        fetchPlot(geoClicked, effectSize);
                                    }}
                                    className='bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600'
                                >
                                    Generate Plot
                                </button>
                            </div>
                        </div>
                    )}

                    <ul className='list-disc list-inside'>
                        {geoList.geos && geoList.geos.map((geo, index) => (
                            <li
                                onClick={() => onClickGeo(geo)}
                                key={index}
                                className={`mb-2 p-2 rounded cursor-pointer ${geoClicked === geo ? 'bg-blue-200 font-semibold' : 'hover:bg-gray-100'
                                    }`}
                            >
                                {geo}
                            </li>
                        ))}
                    </ul>
                </div>

                {analysisData && analysisData.status === 'success' && analysisData.power_analysis && (
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <h2 className='text-xl font-semibold mb-4'>Power Analysis for {analysisData.geo}</h2>
                        <div className='mb-4'>
                            <p className='text-sm text-gray-600'>Days needed to detect different effect sizes at various power levels</p>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Effect Size</th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Power Level</th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Days Needed</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {analysisData.power_analysis.map((row, index) => (
                                        <tr key={index}>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{(row.effect_size * 100).toFixed(0)}%</td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{(row.power_level * 100).toFixed(0)}%</td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{row.days_needed} days</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {analysisData && analysisData.status === 'error' && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
                        <strong>Error:</strong> {analysisData.message}
                    </div>
                )}

                {plotData && plotData.status === 'success' && (
                    <div className='bg-white p-6 rounded-lg shadow mt-6'>
                        <h2 className='text-xl font-semibold mb-4'>Effect Simulation Plot - {plotData.geo} ({(plotData.effect_size * 100).toFixed(0)}% Effect)</h2>
                        <div className='mb-4'>
                            <p className='text-sm text-gray-600'>Synthetic control analysis showing the effect of treatment on the selected geography</p>
                        </div>
                        <div className='flex justify-center'>
                            <img
                                src={`data:image/png;base64,${plotData.plot}`}
                                alt={`Effect simulation for ${plotData.geo}`}
                                className='max-w-full h-auto border border-gray-300 rounded-lg shadow-sm'
                            />
                        </div>
                        <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
                            <div className='bg-blue-50 p-3 rounded'>
                                <h4 className='font-semibold text-blue-900 mb-1'>Pre-Treatment</h4>
                                <p className='text-blue-700'>Blue lines show actual vs synthetic control before treatment</p>
                            </div>
                            <div className='bg-green-50 p-3 rounded'>
                                <h4 className='font-semibold text-green-900 mb-1'>Post-Treatment</h4>
                                <p className='text-green-700'>Green line shows simulated effect after treatment</p>
                            </div>
                        </div>
                    </div>
                )}

                {plotData && plotData.status === 'error' && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
                        <strong>Plot Error:</strong> {plotData.message}
                    </div>
                )}
            </div>
        </div>
    )
}

export default GeoPage
