import React from 'react'
import { useData } from '../datastore/data'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BestModel = () => {
    const { dataLoad, updateData } = useData()
    const navigate = useNavigate()

    // Handle case where no data is loaded yet
    if (!dataLoad) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='text-center'>
                    <div className='text-4xl mb-4'>📊</div>
                    <h2 className='text-xl font-bold mb-2'>No data loaded</h2>
                    <p className='text-gray-600 mb-4'>Please upload a CSV file first.</p>
                    <button
                        onClick={() => navigate("/")}
                        className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                    >
                        Upload CSV
                    </button>
                </div>
            </div>
        )
    }

    // Handle error case
    if (dataLoad.status === 'error') {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='text-center'>
                    <div className='text-4xl mb-4'>⚠️</div>
                    <h2 className='text-xl font-bold mb-2'>Error</h2>
                    <p className='text-red-600 mb-4'>{dataLoad.message}</p>
                    <button
                        onClick={() => navigate("/")}
                        className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // Process data for better visualization
    const chartData = Object.entries(dataLoad.results).map(([geo, metrics]) => ({
        geo,
        nrmse_pre: parseFloat(metrics.nrmse_pre.toFixed(4)),
        nrmse_post: parseFloat(metrics.nrmse_post.toFixed(4)),
        difference: parseFloat((metrics.nrmse_post - metrics.nrmse_pre).toFixed(4))
    }));

    // Calculate some simple stats
    const totalGeos = chartData.length;
    const avgPre = chartData.reduce((sum, item) => sum + item.nrmse_pre, 0) / totalGeos;
    const avgPost = chartData.reduce((sum, item) => sum + item.nrmse_post, 0) / totalGeos;
    const improvedCount = chartData.filter(item => item.nrmse_post < item.nrmse_pre).length;

    return (
        <div className='p-8'>
            <div className='max-w-4xl mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-3xl font-bold'>Analysis Results</h1>
                    <div className='space-x-4'>
                        <button
                            onClick={() => navigate("/geo")}
                            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                        >
                            Explore Models
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
                        >
                            Upload New Data
                        </button>
                    </div>
                </div>

                {/* stats cards */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                    <div className='bg-white p-4 rounded shadow'>
                        <h3 className='text-sm text-gray-600'>Total Geographies</h3>
                        <p className='text-2xl font-bold'>{totalGeos}</p>
                    </div>
                    <div className='bg-white p-4 rounded shadow'>
                        <h3 className='text-sm text-gray-600'>Avg Pre-NRMSE</h3>
                        <p className='text-2xl font-bold'>{avgPre.toFixed(4)}</p>
                    </div>
                    <div className='bg-white p-4 rounded shadow'>
                        <h3 className='text-sm text-gray-600'>Avg Post-NRMSE</h3>
                        <p className='text-2xl font-bold'>{avgPost.toFixed(4)}</p>
                    </div>
                    <div className='bg-white p-4 rounded shadow'>
                        <h3 className='text-sm text-gray-600'>Improved</h3>
                        <p className='text-2xl font-bold text-green-600'>{improvedCount}/{totalGeos}</p>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow'>
                    <h2 className='text-xl font-semibold mb-4'>Status: {dataLoad.status}</h2>
                    <p className='mb-4'>{dataLoad.message}</p>

                    {dataLoad.results && (
                        <div>
                            <h3 className='text-lg font-semibold mb-4'>NRMSE Comparison by Geography</h3>

                            {/* chart */}
                            <div className='mb-6'>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="geo" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="nrmse_pre" fill="#8884d8" name="Pre-Period NRMSE" />
                                        <Bar dataKey="nrmse_post" fill="#82ca9d" name="Post-Period NRMSE" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* table */}
                            <div className='mt-6'>
                                <h4 className='text-md font-semibold mb-3'>Detailed Results</h4>
                                <div className='overflow-x-auto'>
                                    <table className='min-w-full border border-gray-300'>
                                        <thead>
                                            <tr className='bg-gray-100'>
                                                <th className='border border-gray-300 px-4 py-2 text-left'>Geography</th>
                                                <th className='border border-gray-300 px-4 py-2 text-left'>Pre-NRMSE</th>
                                                <th className='border border-gray-300 px-4 py-2 text-left'>Post-NRMSE</th>
                                                <th className='border border-gray-300 px-4 py-2 text-left'>Change</th>
                                                <th className='border border-gray-300 px-4 py-2 text-left'>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartData.map((item) => (
                                                <tr key={item.geo} className='hover:bg-gray-50'>
                                                    <td className='border border-gray-300 px-4 py-2 font-medium'>{item.geo}</td>
                                                    <td className='border border-gray-300 px-4 py-2'>{item.nrmse_pre.toFixed(4)}</td>
                                                    <td className='border border-gray-300 px-4 py-2'>{item.nrmse_post.toFixed(4)}</td>
                                                    <td className='border border-gray-300 px-4 py-2'>
                                                        <span className={item.difference > 0 ? 'text-red-600' : 'text-green-600'}>
                                                            {item.difference > 0 ? '+' : ''}{item.difference.toFixed(4)}
                                                        </span>
                                                    </td>
                                                    <td className='border border-gray-300 px-4 py-2'>
                                                        <span className={`px-2 py-1 rounded text-xs ${item.difference > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {item.difference > 0 ? 'Worse' : 'Better'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Raw data (collapsible) */}
                            <details className='mt-6'>
                                <summary className='cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800'>
                                    View Raw JSON Data
                                </summary>
                                <pre className='mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto'>
                                    {JSON.stringify(dataLoad.results, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BestModel