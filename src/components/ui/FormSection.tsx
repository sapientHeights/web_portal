type Props = {
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    margin? : boolean;
}

export default function FormSection({title, icon, children, margin = true} : Props) {
    return (
        <section className={margin ? "mb-10" : 'mb-0'}>
            <h2 className="flex items-center text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-6">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-1.5 rounded mr-3">{icon}</span>
                {title}
            </h2>
            {children}
        </section>
    )
}