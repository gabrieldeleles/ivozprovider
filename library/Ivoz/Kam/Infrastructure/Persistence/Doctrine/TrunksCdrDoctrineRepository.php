<?php

namespace Ivoz\Kam\Infrastructure\Persistence\Doctrine;

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Ivoz\Core\Infrastructure\Domain\Service\DoctrineQueryRunner;
use Ivoz\Core\Infrastructure\Persistence\Doctrine\Model\Helper\CriteriaHelper;
use Ivoz\Core\Infrastructure\Persistence\Doctrine\Traits\GetGeneratorByConditionsTrait;
use Ivoz\Kam\Domain\Model\TrunksCdr\TrunksCdr;
use Ivoz\Kam\Domain\Model\TrunksCdr\TrunksCdrInterface;
use Ivoz\Kam\Domain\Model\TrunksCdr\TrunksCdrRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * TrunksCdrDoctrineRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class TrunksCdrDoctrineRepository extends ServiceEntityRepository implements TrunksCdrRepository
{
    use GetGeneratorByConditionsTrait;

    private $queryRunner;

    public function __construct(
        ManagerRegistry $registry,
        DoctrineQueryRunner $queryRunner
    ) {
        parent::__construct($registry, TrunksCdr::class);
        $this->queryRunner = $queryRunner;
    }

    /**
     * @inheritdoc
     * @see TrunksCdrRepository::findByCallid
     */
    public function findByCallid($callid)
    {
        /** @var TrunksCdrInterface[] $response */
        $response = $this->findBy([
            'callid' => $callid
        ]);

        return $response;
    }

    /**
     * @inheritdoc
     * @see TrunksCdrRepository::findOneByCallid
     */
    public function findOneByCallid($callid)
    {
        /** @var TrunksCdrInterface $response */
        $response = $this->findOneBy([
            'callid' => $callid
        ]);

        return $response;
    }

    /**
     * This method expects results to be marked as parsed as soon as they're used:
     * a.k.a it does not apply any query offset, just a limit
     *
     * @inheritdoc
     * @see TrunksCdrRepository::getUnparsedCallsGeneratorWithoutOffset
     */
    public function getUnparsedCallsGeneratorWithoutOffset(int $batchSize, array $order = null)
    {
        $dateFrom = new \DateTime(
            '10 seconds ago',
            new \DateTimeZone('UTC')
        );

        $qb = $this->createQueryBuilder('self');
        $qb->addCriteria(CriteriaHelper::fromArray([
            'or' => [
                ['parsed', 'eq', '0'],
                ['parsed', 'isNull'],
            ],
            ['parserScheduledAt', 'lte', $dateFrom->format('Y-m-d H:i:s')],
        ]));
        $qb->setMaxResults($batchSize);

        if ($order) {
            $qb->orderBy(...$order);
        }

        $continue =  true;
        while ($continue) {
            $query = $qb->getQuery();
            $results = $query->getResult();
            $continue = count($results) === $batchSize;

            yield $results;
        }
    }

    /**
     * @inheritdoc
     * @see TrunksCdrRepository::resetParsed
     */
    public function resetParsed(array $ids)
    {
        $now = new  \DateTime(
            'now',
            new \DateTimeZone('UTC')
        );

        $qb = $this
            ->createQueryBuilder('self')
            ->update($this->_entityName, 'self')
            ->set('self.parsed', ':parsed')
            ->setParameter(':parsed', 0)
            ->set('self.parserScheduledAt', ':parserScheduledAt')
            ->setParameter(':parserScheduledAt', $now->format('Y-m-d H:i:s'))
            ->where('self.id in (:ids)')
            ->setParameter(':ids', $ids);

        return $this->queryRunner->execute(
            $this->getEntityName(),
            $qb->getQuery()
        );
    }
}
