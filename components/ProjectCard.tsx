import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ProjectItem, LevelConfigData } from '../types';

interface ProjectCardProps {
    project: ProjectItem;
    levelConfig: LevelConfigData;
}

const ProjectCard: React.FC<ProjectCardProps> = memo(({ project, levelConfig }) => {
    const projectTheme = levelConfig[project.jenjang];
    const bgClass = projectTheme?.bg;

    return (
        <Link to={`/projek/${project.id}`} className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group h-full">
            <div className="relative h-60 overflow-hidden">
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                    <div className={`${bgClass} text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                        {project.jenjang}
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/50 shadow-sm">
                        {project.category}
                    </div>
                </div>
            </div>
            <div className="p-10 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{project.date}</span>
                    <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-islamic-gold-600 transition-colors">{project.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-2">
                    {project.description}
                </p>
                <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center text-[10px] font-black text-white shadow-lg`}>
                        {project.author.substring(0, 2)}
                    </div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{project.author}</span>
                </div>
            </div>
        </Link>
    );
});

export default ProjectCard;
