import NewsComponent from '../components/NewsComponent';

const Trending = () => {
  return (
    <NewsComponent
      keywords="gaming"
      ranked
      heading="Trending"
      subtitle="The gaming and hardware stories moving fastest right now, ranked."
    />
  );
};

export default Trending;
