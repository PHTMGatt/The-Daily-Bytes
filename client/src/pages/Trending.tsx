import NewsComponent from '../components/NewsComponent';

const Trending = () => {
  return (
    <NewsComponent
      keywords="gaming"
      ranked
      heading="Trending"
      subtitle="The newest gaming and hardware stories, top of the feed first."
    />
  );
};

export default Trending;
