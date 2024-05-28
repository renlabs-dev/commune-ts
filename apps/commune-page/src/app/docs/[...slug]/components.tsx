import Link from 'next/link'

export function StartCards() {
  function Card({
    title,
    description,
    link,
  }: {
    title: string
    description: string
    link: string
  }) {
    return (
      <div className='flex flex-col justify-between px-6 pb-6 border border-gray-500 rounded-xl shadow-custom-dark md:w-1/2'>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link
          href={link}
          className='text-sm font-bold no-underline hover:underline'
        >
          View More
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-4 md:flex-row'>
        <Card
          title='Install'
          description='Set up your commune and wallet to start participating in the network.'
          link='/docs/installation/setup-commune'
        />
        <Card
          title='Learn the Concepts'
          description='Understand the basics of the network, weight system, governance, and more.'
          link='/docs/concepts/basics'
        />
      </div>

      <div className='flex flex-col gap-4 md:flex-row'>
        <Card
          title='Code Documentation'
          description='Learn the structure of Commune AI source code, and how to contribute.'
          link='https://docs.communex.ai/communex'
        />
        <Card
          title='Watch Videos'
          description='Watch tutorials and guides on how to operate within the Commune AI network.'
          link='https://www.youtube.com/@project_eden_ai/videos'
        />
      </div>
    </div>
  )
}

export function BasicsCards() {
  function Card({
    title,
    description,
    link,
  }: {
    title: string
    description: string
    link: string
  }) {
    return (
      <div className='flex flex-col justify-between px-6 pb-6 border border-gray-500 rounded-xl shadow-custom-dark md:w-1/3'>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link
          href={link}
          className='text-sm font-bold no-underline hover:underline'
        >
          View More
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-4 md:flex-row'>
        <Card
          title='Mining basics'
          description='How to mine, create a miner, deploy a miner, register a miner.'
          link='/docs/mining/what-is-mining'
        />
        <Card
          title='Validating basics'
          description='How to validate, create a validator, deploy a validator, register a validator.'
          link='/docs/mining/what-is-validating'
        />
        <Card
          title='Subnets basics'
          description='What are subnets, making a subnet, deploying a subnet, subnet parameters, types of subnets.'
          link='/docs/subnets/what-is-a-subnet'
        />
      </div>
      <div className='flex flex-col gap-4 md:flex-row'>
        <Card
          title='Module basics'
          description='What are modules, deploying, registering, and connecting to them.'
          link='/docs/modules/what-is-a-module'
        />
        <Card
          title='Weights basics'
          description='What are weights, how do they work, how to set weights.'
          link='/docs/concepts/weight-system'
        />
        <Card
          title='Governance Basics'
          description='Operate on testnet, run a local node, learn network parameters, learn consensus.'
          link='/docs/subspace/commune-blockchain'
        />
      </div>
    </div>
  )
}

export function SubnetCards() {
  function Card({
    title,
    description,
    link,
  }: {
    title: string
    description: string
    link: string
  }) {
    return (
      <div className='flex flex-col justify-between px-6 pb-6 border border-gray-500 rounded-xl shadow-custom-dark md:w-1/2'>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link
          href={link}
          className='text-sm font-bold no-underline hover:underline'
        >
          View More
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <Card
        title='Subnet Template'
        description='Look at the Github Subnet template, to learn how to build a subnet.'
        link='https://github.com/agicommies/commune-subnet-template'
      />
    </div>
  )
}

export function SubnetListCards() {
  function Card({
    title,
    description,
    link,
  }: {
    title: string
    description: string
    link: string
  }) {
    return (
      <div className='flex flex-col justify-between px-6 pb-6 border border-gray-500 rounded-xl shadow-custom-dark md:w-1/2'>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link
          href={link}
          className='text-sm font-bold no-underline hover:underline'
        >
          View More
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <Card
        title='General Subnet'
        description='The general subnet, designed for human validation.'
        link='/docs/subnets/general-subnet-dao'
      />
      <Card
        title='Mosaic Subnet'
        description='Instantly visualize your ideas.'
        link='https://mosaicx.org/'
      />
      <Card
        title='Synthia'
        description='Continuous stream of synthetic training data with verified quality at scale.'
        link='https://github.com/agicommies/synthia'
      />
    </div>
  )
}

export function SubnetTemplateCards() {
  function Card({
    title,
    description,
    link,
  }: {
    title: string
    description: string
    link: string
  }) {
    return (
      <div className='flex flex-col justify-between px-6 pb-6 border border-gray-500 rounded-xl shadow-custom-dark md:w-1/2'>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link
          href={link}
          className='text-sm font-bold no-underline hover:underline'
        >
          View More
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <Card
        title='See Subnet Template'
        description='See an example of how to structure your subnet code.'
        link='/docs/subnets/subnet-template'
      />
    </div>
  )
}
