import { cn } from '@/lib/utils';

interface Avatar {
  imageUrl: string;
  profileUrl: string;
  name?: string;
}
interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Avatar[];
}

export const AvatarCircles = ({ numPeople, className, avatarUrls }: AvatarCirclesProps) => {
  return (
    <div className={cn('z-10 flex -space-x-4 rtl:space-x-reverse', className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={url.name}
        >
          <img
            className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
            src={url.imageUrl}
            width={40}
            height={40}
            alt={url.name ?? `Avatar ${index + 1}`}
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-center text-xs font-medium text-white dark:border-gray-800">
          +{numPeople}
        </div>
      )}
    </div>
  );
};
