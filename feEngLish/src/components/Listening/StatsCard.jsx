
import React from 'react';

const StatsCard = ({ title, value, description, icon, color = 'blue', trend = null }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-200',
            dark: 'bg-blue-100'
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-600',
            border: 'border-green-200',
            dark: 'bg-green-100'
        },
        yellow: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-600',
            border: 'border-yellow-200',
            dark: 'bg-yellow-100'
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            border: 'border-purple-200',
            dark: 'bg-purple-100'
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-200',
            dark: 'bg-red-100'
        }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`rounded-lg border ${colors.border} ${colors.bg} p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${colors.dark} flex items-center justify-center`}>
                    {icon || (
                        <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    )}
                </div>
            </div>

            <div className="mb-2">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>

            {trend && (
                <div className="flex items-center text-sm">
                    <span className={`${trend.up ? 'text-green-600' : 'text-red-600'} font-medium`}>
                        {trend.up ? '+' : '-'}{trend.value}%
                    </span>
                    <span className="text-gray-500 ml-2">so với tháng trước</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;