import type { CsvTool } from '@/data/csvData'
import { VideoAudioTools } from './impl/VideoAudioTools'
import { ContentWritingTools } from './impl/ContentWritingTools'
import { SeoMarketingTools } from './impl/SeoMarketingTools'
import { DesignCreativeTools } from './impl/DesignCreativeTools'
import { DeveloperTools } from './impl/DeveloperTools'
import { BusinessFinanceTools } from './impl/BusinessFinanceTools'
import { EducationTools } from './impl/EducationTools'
import { HealthTechTools } from './impl/HealthTechTools'
import { PersonalLifestyleTools } from './impl/PersonalLifestyleTools'
import { TechFutureTools } from './impl/TechFutureTools'
import { ClimateEnvironmentTools } from './impl/ClimateEnvironmentTools'
import { EntertainmentTools } from './impl/EntertainmentTools'
import { GamingTools } from './impl/GamingTools'
import { IotRoboticsTools } from './impl/IotRoboticsTools'
import { SpaceTools } from './impl/SpaceTools'
import { ScienceTools } from './impl/ScienceTools'
import { GenericTool } from './impl/GenericTool'

interface ToolEngineProps {
  tool: CsvTool
}

export function ToolEngine({ tool }: ToolEngineProps) {
  const cat = tool.category

  switch (cat) {
    case 'Video/Audio Tools': return <VideoAudioTools tool={tool} />
    case 'Content Writing': return <ContentWritingTools tool={tool} />
    case 'SEO/Digital Marketing': return <SeoMarketingTools tool={tool} />
    case 'Design/Creative': return <DesignCreativeTools tool={tool} />
    case 'Developers/Coding': return <DeveloperTools tool={tool} />
    case 'Business/Finance': return <BusinessFinanceTools tool={tool} />
    case 'Education/Learning': return <EducationTools tool={tool} />
    case 'HealthTech/BioTech': return <HealthTechTools tool={tool} />
    case 'Personal/Lifestyle': return <PersonalLifestyleTools tool={tool} />
    case 'Technology/Future': return <TechFutureTools tool={tool} />
    case 'Climate/Environment': return <ClimateEnvironmentTools tool={tool} />
    case 'Entertainment/Culture': return <EntertainmentTools tool={tool} />
    case 'Gaming/ARVR': return <GamingTools tool={tool} />
    case 'IoT/Robotics': return <IotRoboticsTools tool={tool} />
    case 'Space/Astronomy': return <SpaceTools tool={tool} />
    case 'Generative Science': return <ScienceTools tool={tool} />
    default: return <GenericTool tool={tool} />
  }
}
